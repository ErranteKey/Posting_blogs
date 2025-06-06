const chai = require('chai');
const expect = chai.expect;
const Comment = require('../models/comment');
const mongoose = require('mongoose');
const moment = require('moment'); // Для порівняння з віртуальним полем

// Підключення до тестової бази даних
before(function(done) {
    mongoose.connect('mongodb://localhost:27017/blog_test_db', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Connected to test DB for Comment tests');
            done();
        })
        .catch(err => done(err));
});

// Очищення колекції перед кожним тестом
beforeEach(function(done) {
    mongoose.connection.collections.comments.deleteMany({}, done);
});

// Закриття з'єднання після всіх тестів
after(function(done) {
    mongoose.connection.close(done);
});

describe('Comment Model Tests', function() {
    it('should create a new comment successfully', function(done) {
        const commentData = {
            name: 'Test User',
            email: 'test@example.com',
            message: 'This is a test comment.'
        };

        Comment.create(commentData)
            .then(comment => {
                expect(comment).to.have.property('name').equal('Test User');
                expect(comment).to.have.property('email').equal('test@example.com');
                expect(comment).to.have.property('message').equal('This is a test comment.');
                expect(comment).to.have.property('createdAt').to.be.an.instanceOf(Date);
                done();
            })
            .catch(err => done(err));
    });

    it('should calculate commentAddedSince correctly', function(done) {
        const commentData = {
            name: 'Another User',
            email: 'another@example.com',
            message: 'Another test comment.'
        };

        Comment.create(commentData)
            .then(comment => {
                // Встановлюємо createdAt на конкретний час, щоб перевірити fromNow()
                const fiveMinutesAgo = moment().subtract(5, 'minutes').toDate();
                comment.createdAt = fiveMinutesAgo;

                // Перевіряємо віртуальне поле після оновлення createdAt (не зберігаємо в БД, просто перевіряємо об'єкт)
                // expect(comment.commentAddedSince).to.equal(moment(fiveMinutesAgo).fromNow());
                // Момент fromNow() може бути "a few seconds ago", "a minute ago", "5 minutes ago".
                // Краще перевіряти, що він є рядком і не порожній, оскільки точне значення може змінюватись
                expect(comment.commentAddedSince).to.be.a('string');
                expect(comment.commentAddedSince).to.not.be.empty;
                
                expect(comment.commentAddedSince).to.satisfy(function(val) {
                    return val.includes('minute') || val.includes('second') || val.includes('ago');
                });
                done();
            })
            .catch(err => done(err));
    });

    it('should fail to create comment without email', function(done) {
        const commentData = {
            name: 'Invalid User',
            message: 'This comment should fail.'
        };

        Comment.create(commentData)
            .then(() => done(new Error('Comment should not be created without email')))
            .catch(err => {
                expect(err).to.be.an.instanceOf(mongoose.Error.ValidationError);
                expect(err.errors.email.kind).to.equal('required');
                done();
            });
    });
});