#!/bin/bash

function package() {
    if [[ $1 == 'pack' ]]; then
        BROWSER_FILE="dist/browser/swig.pack.js"
        TEMP_FILE="dist/.swig.pack.js"
        MIN_FILE="dist/browser/swig.pack.min.js"
    else
        BROWSER_FILE="dist/browser/swig.js"
        TEMP_FILE="dist/.swig.js"
        MIN_FILE="dist/browser/swig.min.js"
    fi

    cat dist/header.js >> $BROWSER_FILE
    echo "swig = (function () {" >> $BROWSER_FILE
    echo "var swig = {}," >> $BROWSER_FILE
    echo "dateformat = {}," >> $BROWSER_FILE
    echo "filters = {}," >> $BROWSER_FILE
    echo "helpers = {}," >> $BROWSER_FILE
    echo "parser = {}," >> $BROWSER_FILE
    echo "tags = {};" >> $BROWSER_FILE

    if [[ $1 == 'pack' ]]; then
        cat node_modules/underscore/underscore.js >> $BROWSER_FILE
    fi

    echo "(function (exports) {" >> $BROWSER_FILE
    cat index.js >> $BROWSER_FILE
    echo "})(swig);" >> $BROWSER_FILE

    echo "(function (exports) {" >> $BROWSER_FILE
    cat lib/dateformat.js >> $BROWSER_FILE
    echo "})(dateformat);" >> $BROWSER_FILE

    echo "(function (exports) {" >> $BROWSER_FILE
    cat lib/filters.js >> $BROWSER_FILE
    echo "})(filters);" >> $BROWSER_FILE

    echo "(function (exports) {" >> $BROWSER_FILE
    cat lib/helpers.js >> $BROWSER_FILE
    echo "})(helpers);" >> $BROWSER_FILE

    echo "(function (exports) {" >> $BROWSER_FILE
    cat lib/parser.js >> $BROWSER_FILE
    echo "})(parser);" >> $BROWSER_FILE

    echo "(function (exports) {" >> $BROWSER_FILE
    cat lib/tags.js >> $BROWSER_FILE
    echo "})(tags);" >> $BROWSER_FILE

    echo "return swig;" >> $BROWSER_FILE
    echo "})();" >> $BROWSER_FILE

    cp $BROWSER_FILE $TEMP_FILE
    sed "/require/d" <$TEMP_FILE > $BROWSER_FILE
    rm $TEMP_FILE

    node_modules/uglify-js/bin/uglifyjs $BROWSER_FILE > $MIN_FILE
}

rm -rf dist/browser
mkdir -p dist/browser
package
package "pack"

cp dist/browser/swig.pack.js dist/test/swig.pack.js