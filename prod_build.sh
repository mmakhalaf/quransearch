ng build --output-path docs --prod --aot --optimization --vendor-chunk --common-chunk --build-optimizer --extract-css --delete-output-path --stats-json
rm -rvf ../mmakhalaf.github.io/*
cp -rvf docs/* ../mmakhalaf.github.io
