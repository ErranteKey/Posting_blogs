const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire'); // Дозволяє мокати залежності модулів

// Моки для залежностей router.js
let UserStub = {};
let PostStub = {};
let CommentStub = {};
let keysStub = {
    disableEmailSending: "yes", // За замовчуванням вимкнемо відправку email
    addKeyValue: sinon.stub().returnsThis(), // Стуб для addKeyValue
    regMailOptions: {},
    forgotMailOptions: {},
    resetMailOptions: {},
    passwordExpirationTimeInMills: 3600000 // 1 година
};
let mailerStub = {
    sendMail: sinon.stub()
};
let passportStub = {
    authenticate: sinon.stub().returns((req, res, next) => next()), // Заглушка для passport.authenticate
    serializeUser: sinon.stub(),
    deserializeUser: sinon.stub()
};

// Проксі-завантаження router.js з нашими стабами
const routerFactory = proxyquire('../routes/router', {
    '../models/user': UserStub,
    '../models/post': PostStub,
    '../models/comment': CommentStub,
    '../config/keys': keysStub,
    '../mailer/nodemailer': mailerStub
});

// Створення Express-додатку для тестування маршрутів
const express = require('express');
let app;
let request; // supertest або інший інструмент для HTTP-запитів

// Додатково для тестування маршрутів
const supertest = require('supertest');

describe('Router Tests', function() {
    beforeEach(function() {
        // Очищаємо всі стаби та моки перед кожним тестом
        sinon.resetHistory();
        UserStub = {
            create: sinon.stub(),
            findOne: sinon.stub(),
            getAuthenticated: sinon.stub()
        };
        PostStub = {
            find: sinon.stub(),
            findById: sinon.stub()
        };
        CommentStub = {
            create: sinon.stub()
        };
        keysStub.disableEmailSending = "yes"; // Скидаємо до значення за замовчуванням
        keysStub.addKeyValue.resetHistory();
        mailerStub.sendMail.resetHistory();

        // Ініціалізуємо Express-додаток для тестування маршрутів
        app = express();
        app.use(require('body-parser').urlencoded({ extended: true }));
        app.use(require('express-session')({ secret: 'test_secret', resave: false, saveUninitialized: true }));
        app.use(require('express-flash-messages')());
        app.use(passportStub.initialize());
        app.use(passportStub.session());

        // Middleware для req.login (passport)
        app.use((req, res, next) => {
            req.login = sinon.stub().callsFake((user, cb) => cb(null)); // Заглушка для req.login
            req.isAuthenticated = sinon.stub().returns(true); // Заглушка для loggedInOnly
            req.isUnauthenticated = sinon.stub().returns(false); // Заглушка для loggedOutOnly
            req.flash = sinon.stub(); // Мокаємо req.flash
            res.render = sinon.stub(); // Мокаємо res.render
            res.redirect = sinon.stub(); // Мокаємо res.redirect
            res.status = sinon.stub().returnsThis(); // Мокаємо res.status
            res.end = sinon.stub(); // Мокаємо res.end
            next();
        });

        app.use('/', routerFactory(passportStub)); // Передаємо PassportStub

        request = supertest(app);
    });

    afterEach(function() {
        // Відновлюємо оригінальні функції Sinon після кожного тесту
        sinon.restore();
    });

    // Test for /register route (POST)
    describe('POST /register', function() {
        it('should register a new user and redirect to home if successful (email disabled)', function(done) {
            const userData = { username: 'testuser', email: 'test@example.com', password: 'password123' };
            const createdUser = { _id: 'someid', username: userData.username, email: userData.email, save: sinon.stub().resolves(this) };

            UserStub.create.withArgs(userData).returns(Promise.resolve(createdUser));

            request
                .post('/register')
                .send(userData)
                .expect(302) // Очікуємо редирект
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(UserStub.create.calledOnceWith(userData)).to.be.true;
                    expect(mailerStub.sendMail.called).to.be.false; // Email sending disabled
                    expect(res.header.location).to.equal('/');
                    done();
                });
        });

        it('should register a new user and send email if successful (email enabled)', function(done) {
            keysStub.disableEmailSending = "no"; // Вмикаємо відправку email
            const userData = { username: 'testuser2', email: 'test2@example.com', password: 'password123' };
            const createdUser = { _id: 'someid2', username: userData.username, email: userData.email, save: sinon.stub().resolves(this) };

            UserStub.create.withArgs(userData).returns(Promise.resolve(createdUser));
            mailerStub.sendMail.callsFake((options, cb) => cb(null, {})); // Імітуємо успішну відправку

            request
                .post('/register')
                .send(userData)
                .expect(302)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(UserStub.create.calledOnceWith(userData)).to.be.true;
                    expect(keysStub.addKeyValue.calledOnceWith(keysStub.regMailOptions, 'to', userData.email)).to.be.true;
                    expect(mailerStub.sendMail.calledOnce).to.be.true;
                    expect(res.header.location).to.equal('/');
                    done();
                });
        });

        it('should redirect to register page if username is taken (ValidationError)', function(done) {
            const userData = { username: 'existinguser', email: 'test@example.com', password: 'password123' };
            const validationError = new Error('Validation Error');
            validationError.name = 'ValidationError';
            UserStub.create.returns(Promise.reject(validationError)); // Імітуємо помилку валідації

            request
                .post('/register')
                .send(userData)
                .expect(302)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(UserStub.create.calledOnce).to.be.true;
                    expect(res.header.location).to.equal('/register');
                    done();
                });
        });

        it('should call next with error if other error occurs', function(done) {
            const userData = { username: 'testuser', email: 'test@example.com', password: 'password123' };
            const genericError = new Error('Something went wrong');
            UserStub.create.returns(Promise.reject(genericError));

            // Ми хочемо перевірити, що `next(err)` викликається, тому використовуємо обробник помилок Express
            app.use((err, req, res, next) => {
                expect(err).to.equal(genericError);
                done(); // Завершуємо тест тут, якщо `next` викликано з помилкою
            });

            request
                .post('/register')
                .send(userData)
                .end((err) => {
                    // Якщо `next` не був викликаний, то `done()` буде викликаний в іншому місці або тест закінчиться тайм-аутом
                    // У цьому випадку ми очікуємо, що обробник помилок `app.use` буде викликаний
                });
        });
    });

    // Test for /login route (GET)
    describe('GET /login', function() {
        it('should render login page if unauthenticated', function(done) {
            // Перевизначаємо req.isUnauthenticated для цього тесту
            app = express();
            app.use(require('express-session')({ secret: 'test_secret', resave: false, saveUninitialized: true }));
            app.use(require('express-flash-messages')());
            app.use(passportStub.initialize());
            app.use(passportStub.session());
            app.use((req, res, next) => {
                req.isUnauthenticated = sinon.stub().returns(true); // Для цього тесту - неавтентифікований
                res.render = sinon.stub();
                res.redirect = sinon.stub();
                next();
            });
            app.use('/', routerFactory(passportStub));
            request = supertest(app);


            request
                .get('/login')
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.render.calledOnceWith('login', { layout: 'pre_signin' })).to.be.true;
                    done();
                });
        });

        it('should redirect to home page if authenticated', function(done) {
            // Перевизначаємо req.isUnauthenticated для цього тесту
            app = express();
            app.use(require('express-session')({ secret: 'test_secret', resave: false, saveUninitialized: true }));
            app.use(require('express-flash-messages')());
            app.use(passportStub.initialize());
            app.use(passportStub.session());
            app.use((req, res, next) => {
                req.isAuthenticated = sinon.stub().returns(true); // Для цього тесту - автентифікований
                req.isUnauthenticated = sinon.stub().returns(false);
                res.render = sinon.stub();
                res.redirect = sinon.stub();
                next();
            });
            app.use('/', routerFactory(passportStub));
            request = supertest(app);

            request
                .get('/login')
                .expect(302)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.redirect.calledOnceWith('/')).to.be.true;
                    done();
                });
        });
    });
});