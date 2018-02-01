let gulp = require('gulp'),
    iconv = require('gulp-iconv'),
    del = require('del'),
    git = require('gulp-git'),
    path = require('path'),
    tar = require('gulp-tar'),
    gzip = require('gulp-gzip'),
    file = require('gulp-file'),
    os = require('os'),
    moment = require('moment'),
    sequence = require('run-sequence');

const buildFolder = 'build';
const distrFolder = 'dist';

// ������� ���������� �� �������
gulp.task('clean', function () {
    del(buildFolder);
});

// ����������� ���� ������ ������ � ���������� ������
gulp.task('move', function () {
    return gulp.src(
        [
            './last_version/**'
        ]
    ).pipe(gulp.dest(buildFolder));
});

// ����������� � 1251
gulp.task('encode', function () {
    return gulp.src([
        path.join(buildFolder, '**/*.php'),
        path.join(buildFolder, '**/*.js')
    ], {dot: true})
        .pipe(iconv({encoding: 'win1251'}))
        .pipe(gulp.dest(buildFolder));
});

// ���������� � tar.gz
gulp.task('archive', function () {
    return gulp.src(path.join(buildFolder, '**/*'))
        .pipe(tar('.last_version.tar'))
        .pipe(gzip())
        .pipe(gulp.dest(buildFolder));
});

// ��������� � ���������� � �������������
gulp.task('dist', function () {
    return gulp.src(path.join(buildFolder, '.last_version.tar.gz'))
        .pipe(gulp.dest(distrFolder));
});

// �������� ���� � ������� ������
gulp.task('version', function () {

    git.exec({args: 'log --tags --simplify-by-decoration --pretty="format:%cI %d"'}, function (error, output) {

        const versions = output.trim().split(os.EOL);

        // � ������ ����� ���-�� ����:
        // Sun, 3 Dec 2017 00:05:48 +0300  (tag: 0.0.10)
        // Tue, 21 Nov 2017 23:58:01 +0300  (tag: 0.0.9)
        // Tue, 7 Nov 2017 23:45:17 +0300  (tag: 0.0.8)
        // Sun, 22 Oct 2017 00:10:00 +0300

        let last = '';
        if (versions.length <= 1) {
            // ���� ������ ���, �� �������� �����
            last = moment().format() + '  (tag: 0.0.1)';
        } else {
            last = versions[0];
        }

        const pattern = /(.*)\s\s\(tag: (.*)\)/gi;
        const match = pattern.exec(last);
        const lastVersionDate = moment(match[1]).format('YYYY-MM-DD HH:mm:ss');
        const lastVersion = match[2];

        const fileContents = `<?php
$arModuleVersion = array(
    'VERSION' => '${ lastVersion }',
    'VERSION_DATE' => '${ lastVersionDate }',
);`;
        return file('version.php', fileContents)
            .pipe(gulp.dest(path.join(buildFolder, 'install')));

    });
});

// ������ ������� ������ ������
gulp.task('build_last_version', function (callback) {
    sequence('clean', 'move', 'version', 'encode', 'archive', 'dist', 'clean', callback);
});

// ������ ���������� ������ (������� ����� ��������� � ������������� ������� �� ����� git)
gulp.task('build_update', function (callback) {

});

// ������ ����� ������
gulp.task('build', function (callback) {
    sequence('build_last_version', 'build_update', callback);
});