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
            './**',
            '!./{node_modules,node_modules,dist,build/**}',
            '!./*.js',
            '!./*.json',
            '!./*.md'
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

// ������ ������� ������ ������
gulp.task('build_last_version', function (callback) {
    sequence('clean', 'move', 'encode', 'archive', 'dist', 'clean', callback);
});

// ������ ����� ������
gulp.task('build', function (callback) {
    sequence('build_last_version', callback);
});