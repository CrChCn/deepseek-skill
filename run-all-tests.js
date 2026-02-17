#!/usr/bin/env node
const { execSync } = require('child_process');

const tests = [
    'working.js',
    'test-merkle-integration.js',
    'test-token.js'
];

console.log('ЗАПУСК ТЕСТОВ');
console.log('=============\n');

let passed = 0;

tests.forEach(test => {
    process.stdout.write('Запуск ' + test + '... ');
    try {
        execSync('node ' + test, { stdio: 'pipe', timeout: 5000 });
        console.log('УСПЕШНО');
        passed++;
    } catch (error) {
        console.log('ОШИБКА');
        console.log('   ' + error.message.split('\n')[0]);
    }
});

console.log('\nРезультаты: ' + passed + '/' + tests.length + ' тестов пройдено');
