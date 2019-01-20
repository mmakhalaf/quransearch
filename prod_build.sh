ng build --output-path docs --base-href "https://mmakhalaf.github.io/" --prod --aot --optimization --vendor-chunk --common-chunk --build-optimizer --extract-css --delete-output-path --stats-json
cp docs/index.html docs/404.html
rm -rvf ../mmakhalaf.github.io/*
cp -rvf docs/* ../mmakhalaf.github.io
