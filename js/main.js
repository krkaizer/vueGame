// переменная для инициализации работы vue
let app = new Vue({
    el: '.main', //селектор элемента который будет являться вью
    data: { //любые нужные значения
        showMain: true,
        showSocial: false,
        showAchievments: false,
        showQuestions: false,
        showResult: false,

        number: 0, //номер вопроса
        score: { //кол-во рас
            'zerg': 0,
            'primal': 0,
            'protoss': 0,
            'taldarim': 0,
            'terran': 0
        },
        //кол-во игр за каждую расу
        totalGame: localStorage.getItem('sc2TotalGame') ? JSON.parse(localStorage.getItem('sc2TotalGame')) //извлекаем из хранилища
            : {
                //если нет никаких значений - всё по 0
                'zerg': 0,
                'primal': 0,
                'protoss': 0,
                'taldarim': 0,
                'terran': 0,
                'infested': 0,
                'hybrid': 0
            },
        //кол-во сыгранных матчей
        totalGames: localStorage.getItem('sc2TotalGames') ? localStorage.getItem('sc2TotalGames') : 0,
        questions: questions, //обозначена в const.js и установится в данную переменную
        results: results, //аналогично ^
        resultRace: 'infested',
    },
    methods: {
        goToMain() { //перенаправление на главную страницу с любой другой
            this.showMain = true;
            this.showSocial = false;
            this.showAchievments = false;
            this.showQuestions = false;
            this.showResult = false;
        },
        goToSocial() { //перенаправление на страницу с контактами
            this.showMain = false;
            this.showSocial = true;
            this.showAchievments = false;
            this.showQuestions = false;
            this.showResult = false;
        },
        goToAchievments() { //перенаправление на страницу с достижениями
            if (this.totalGames > 0) {
                this.showMain = false;
                this.showSocial = false;
                this.showAchievments = true;
                this.showQuestions = false;
                this.showResult = false;
            } else { //если достижений нет - переход на начало игры
                this.goToQuestions();
            }
        },
        goToQuestions() { //перенаправление на страницу с вопросами
            this.score = { //чтобы когда игра началась все переменные начались с нуля
                'zerg': 0,
                'primal': 0,
                'protoss': 0,
                'taldarim': 0,
                'terran': 0
            }

            this.showMain = false;
            this.showSocial = false;
            this.showAchievments = false;
            this.showQuestions = true;
            this.showResult = false;
        },
        goToResult(race) { //перенаправление на страницу с результатом
            this.showMain = false;
            this.showSocial = false;
            this.showAchievments = false;
            this.showQuestions = false;
            this.showResult = true;
            this.resultRace = race; //будет передаваться в методе
        },
        nextQuestion(answer) {
            if (this.number == 24) {
                this.number = 0;
                this.endGame();
            } else {
                this.number++;
            }
            eval(answer);
        },
        endGame() {
            this.totalGames++;
            localStorage.setItem('sc2TotalGames', this.totalGames);
            //Зерг - в зависимости от ответов и с учётом проверки того что zerg это не значение по умолчанию
            if (this.score.zerg > this.score.protoss &&
                this.score.zerg > this.score.terran &&
                this.score.primal < 8 &&
                Math.abs(this.score.protoss - this.score.zerg) > 3) {
                    this.goToResult('zerg');
                    this.totalGame.zerg++; //увеличиваем количество игр за расу Зерг
            }
            //primal
            else if (this.score.primal > this.score.protoss &&
                this.score.primal > this.score.terran &&
                this.score.primal == 8) {
                    this.goToResult('primal');
                    this.totalGame.primal++;
            }
            //protoss
            else if (this.score.protoss > this.score.zerg &&
                this.score.protoss > this.score.terran &&
                this.score.taldarim < 5 &&
                Math.abs(this.score.protoss - this.score.zerg) > 3) {
                    this.goToResult('protoss');
                    this.totalGame.primal++;
            }
            //taldarim
            else if (this.score.protoss > this.score.zerg &&
                this.score.protoss > this.score.terran &&
                this.score.taldarim == 5) {
                    this.goToResult('taldarim');
                    this.totalGame.taldarim++;
            }
            //terran
            else if (this.score.terran > this.score.zerg &&
                this.score.terran > this.score.protoss &&
                this.score.taldarim == 5) {
                    this.goToResult('terran');
                    this.totalGame.terran++;
            }
            //hybrid
            else if (Math.abs(this.score.protoss - this.score.zerg) <= 3) {
                    this.goToResult('hybrid');
                    this.totalGame.hybrid++;
            }
            //infested
            else {
                    this.goToResult('infested');
                    this.totalGame.infested++;
            }
            localStorage.setItem('sc2TotalGame', JSON.stringify(this.totalGame))
        }
    },
    computed: {
        // подсчёт общих очков, дающихся за каждую расу
        totalScore() {
            let score = 0;
            for (let i in this.totalGame) {
                score +=(this.totalGame[i]*results[i].points)
            }
            return score 
        },
        // открытые расы
        openRaces() {
            let count = 0;
            for (let i in this.totalGame) {
                if(this.totalGame[i]>0) count++
            }
            return count
        },
        favoriteRace() {
            let max='zerg';
            for (let i in this.totalGame) {
                if(this.totalGame[i]>this.totalGame[max]) {
                    max = i;
                }
            }
            return results[max].name
        },
        showResultRace() {
            return {
                'zerg': this.totalGame.zerg > 0 ? true : false,
                'primal': this.totalGame.primal > 0 ? true : false,
                'protoss': this.totalGame.protoss > 0 ? true : false,
                'taldarim': this.totalGame.taldarim > 0 ? true : false,
                'terran': this.totalGame.terran > 0 ? true : false,
                'infested': this.totalGame.infested > 0 ? true : false,
                'hybrid': this.totalGame.hybrid > 0 ? true : false
            }
        }
    }
})


// вкл/выкл звук
let audio = new Audio('audio/soundtrack.mp3');
let audio_btn = document.querySelector('.btn__sound'); //получим кнопку
let audio_icon = document.querySelector('.btn__sound i'); //получим иконку

audio.muted = true;
audio.autoplay = true;
audio.volume = 0.2;

audio.addEventListener('loadmetadata', //если звук уже загружен
function() { //установим позицию воспроизведения
    audio.currentTime = 0 + Math.random * (audio.duration + 1 - 0); //случайное место воспроизведения
})

audio_btn.addEventListener('click', function() {
    if(audio.muted) {
        audio.muted = false;
        audio_icon.classList.add('fa-volume-up');
        audio_icon.classList.remove('fa-volume-off');
    } else if (!audio.muted) {
        audio.muted = true;
        audio_icon.classList.add('fa-volume-off');
        audio_icon.classList.remove('fa-volume-up');
    }
})