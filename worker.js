var kue = require('kue-scheduler');
var Queue = kue.createQueue();


//somewhere process your scheduled jobs
Queue.process('bao', function(job, done) {
    console.log(job.id);
    console.log(job.expiryKey);
    console.log('bao done');
    return done();
});