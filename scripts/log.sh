#!/bin/bash
if [ ! -n "$1" ]; then
    ENV=trunk;
else
    ENV=${1};
fi


TRIMTS="sed  's/\[[^2]*2014[^\]]\]//g'";
TAIL="tail -f"

multitail -mb 1 -ts -t "PHP Errors" -ci red  -L "$TAIL /var/log/php5/error.log | $TRIMTS | sed 's/^ PHP/\[PHP\]/g'" \
    -ts -ci yellow  -L "$TAIL /data/intelliad/$ENV/frontend/log/application.log | $TRIMTS | sed 's/^/\[FR\]/g'" \
    -ts -ci yellow  -L "$TAIL /data/intelliad/$ENV/services/log/application.log | $TRIMTS | sed 's/^/\[SL\]/g'" \
    -ts -mb 1 -t "Apache Error Logs" -ci red -l  "$TAIL /var/log/apache2/${ENV}.frontend.local-error.log | $TRIMTS | grep -v -e '2Zlib: Compressed' | sed 's/^/\[FR\]/g' " \
    -ts -ci red -L "$TAIL /var/log/apache2/${ENV}.services.local-error.log | $TRIMTS | sed 's/^/\[SL\]/g'"

