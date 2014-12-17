if [ -z ${1+x} ]; then
    BRANCH=current
else
    BRANCH=${1}
fi

BASEPATH=/data/intelliad/$BRANCH
FRONTENT=$BASEPATH/frontend
SERVICES=$BASEPATH/services

echo 'Removing... '$BASEPATH
rm -Rf $FRONTENT
rm -Rf $SERVICES

echo 'Creating... '$BASEPATH
mkdir -p $FRONTENT
mkdir -p $SERVICES
