#!/bin/bash

echo -ne "Building For Browser"

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

    cat dist/header.js > $BROWSER_FILE
    echo -ne "."
    cat dist/browser.js >> $BROWSER_FILE
    echo -ne "."
    echo "swig = (function () {" >> $BROWSER_FILE
    echo "var swig = {}," >> $BROWSER_FILE
    echo "dateformat = {}," >> $BROWSER_FILE
    echo "filters = {}," >> $BROWSER_FILE
    echo "helpers = {}," >> $BROWSER_FILE
    echo "parser = {}," >> $BROWSER_FILE
    echo "tags = {};" >> $BROWSER_FILE

    if [[ $1 == 'pack' ]]; then
        cat node_modules/underscore/underscore.js >> $BROWSER_FILE
        echo -ne "."
    fi

    echo "(function (exports) {" >> $BROWSER_FILE
    cat index.js >> $BROWSER_FILE
    echo "})(swig);" >> $BROWSER_FILE
    echo -ne "."

    echo "(function (exports) {" >> $BROWSER_FILE
    cat lib/helpers.js >> $BROWSER_FILE
    echo "})(helpers);" >> $BROWSER_FILE
    echo -ne "."

    echo "(function (exports) {" >> $BROWSER_FILE
    cat lib/dateformat.js >> $BROWSER_FILE
    echo "})(dateformat);" >> $BROWSER_FILE
    echo -ne "."

    echo "(function (exports) {" >> $BROWSER_FILE
    cat lib/filters.js >> $BROWSER_FILE
    echo "})(filters);" >> $BROWSER_FILE
    echo -ne "."

    echo "(function (exports) {" >> $BROWSER_FILE
    cat lib/parser.js >> $BROWSER_FILE
    echo "})(parser);" >> $BROWSER_FILE
    echo -ne "."

    find lib/tags -name "*.js" ! -name "*.test.js" | while read FILE; do
        NAME=$(basename $FILE)
        NAME=$(sed -e 's/.js//' <<< $NAME)
        echo "tags['$NAME'] = (function () {" >> $BROWSER_FILE
        echo "module = {};" >> $BROWSER_FILE
        cat $FILE >> $BROWSER_FILE
        echo "return module.exports;" >> $BROWSER_FILE
        echo "})();" >> $BROWSER_FILE
        echo -ne "."
    done

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


find lib -name "*.test.js" ! -name "helpers.test.js" | while read FILE; do
    TEST_FILE=$(basename $FILE)
    TEMP_FILE="dist/.$TEST_FILE"
    NAME=$(sed -e 's/.test.js//' <<< $TEST_FILE)
    cat $FILE >> dist/test/$TEST_FILE

    cp dist/test/$TEST_FILE $TEMP_FILE
    sed "/require\([^\)]\)/d" <$TEMP_FILE > dist/test/$TEST_FILE
    cp dist/test/$TEST_FILE $TEMP_FILE
    sed "s/testCase/nodeunit.testCase/" <$TEMP_FILE > dist/test/$TEST_FILE
    cp dist/test/$TEST_FILE $TEMP_FILE
    sed "s/__dirname/\'\'/" <$TEMP_FILE > dist/test/$TEST_FILE
    rm $TEMP_FILE

    echo -ne "."
done

echo "Done"
