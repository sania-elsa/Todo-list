const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));

// Compile SCSS to CSS
function compileSass() {
    return gulp.src("scss/style.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest("./"));
}

// Watch SCSS files for changes
function watchFiles() {
    gulp.watch("scss/**/*.scss", compileSass);
}

// Default task
exports.default = gulp.series(
    compileSass,
    watchFiles
);