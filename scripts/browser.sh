#!/bin/bash

echo -ne "Building For Browser"

function package() {
    if [[ $1 == 'pack' ]]; then
        BROWSER_FILE="dist/swig.pack.js"
        TEMP_FILE="dist/.swig.pack.js"
        MIN_FILE="dist/swig.pack.min.js"
    else
        BROWSER_FILE="dist/swig.js"
        TEMP_FILE="dist/.swig.js"
        MIN_FILE="dist/swig.min.js"
    fi

    cat scripts/browser/header.js > $BROWSER_FILE
    echo -ne "."
    cat scripts/browser/browser.js >> $BROWSER_FILE
    echo -ne "."
    echo "swig = (function () {" >> $BROWSER_FILE
    echo "var swig = {}," >> $BROWSER_FILE
    echo "dateformat = {}," >> $BROWSER_FILE
    echo "filters = {}," >> $BROWSER_FILE
    echo "helpers = {}," >> $BROWSER_FILE
    echo "parser = {}," >> $BROWSER_FILE
    echo "tags = {};" >> $BROWSER_FILE

    if [[ $2 == 'test' ]]; then
        echo "window.dateformat = dateformat;" >> $BROWSER_FILE
        echo "window.filters = filters;" >> $BROWSER_FILE
        echo "window.helpers = helpers;" >> $BROWSER_FILE
        echo "window.parser = parser;" >> $BROWSER_FILE
        echo "window.tags = tags;" >> $BROWSER_FILE
    fi

    if [[ $1 == 'pack' ]]; then
        cat node_modules/underscore/underscore.js >> $BROWSER_FILE
        echo -ne "."
    fi

    echo "(function (exports) {" >> $BROWSER_FILE
    cat lib/swig.js >> $BROWSER_FILE
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

rm -rf dist
mkdir -p dist
package

package "pack" "test"
mv dist/swig.pack.js tests/browser/swig.pack.js

package "pack"

find tests/node -name "*.test.js" | while read FILE; do
    TEST_FILE=$(basename $FILE)
    TEMP_FILE="dist/.$TEST_FILE"
    NAME=$(sed -e 's/.test.js//' <<< $TEST_FILE)
    cat $FILE > tests/browser/$TEST_FILE

    cp tests/browser/$TEST_FILE $TEMP_FILE
    sed "/require[(]/d" <$TEMP_FILE > tests/browser/$TEST_FILE
    cp tests/browser/$TEST_FILE $TEMP_FILE
    sed "s/__dirname/\'\'/" <$TEMP_FILE > tests/browser/$TEST_FILE
    rm $TEMP_FILE

    echo -ne "."
done

echo "Done"
