function createMapObj(objPoints) {
    $.ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        url: "/points/getGeoObjects",
        data: JSON.stringify({
            objPoints: objPoints,
        }),
        success: function (data) {
            if (data != ""){
            var myPoints = data;
            $('#points_map>*').remove();
            ymaps.ready(function () {
                $('#map_modal .preloader_partial').hide();
                if (data !== null){
                    var lastPoint  = data.length;
                }else{
                    var lastPoint  = "";
                }

                if (data !== null && data[0]){
                    var latitude = data[0].coords[0];
                    var longitude = data[lastPoint - 1].coords[1];
                }else{
                    var latitude = 55.80;
                    var longitude = 49.15;
                }

                var resArr,
                        clickLast,
                        coordsPoint,
                        myMap = new ymaps.Map("points_map", {
                            center: [
                                latitude, longitude
                            ],
                            zoom: 11,
                            controls: ['geolocationControl', 'typeSelector', 'trafficControl', 'zoomControl']
                        }, {
                            minZoom: 5,
                            maxZoom: 17
                        });

                // Создаем коллекцию.
                myCollection = new ymaps.GeoObjectCollection();
                var myClusterer = new ymaps.Clusterer({
                    preset:  'islands#invertedYellowClusterIcons'
            });//создаем кластер

                // Создаем массив с данными.
                var MyBalloonContentLayout2 = ymaps.templateLayoutFactory.createClass(
                        '<div class="popover-content-metro flex flex-center-vertical"><div>$[properties.balloonContent]</div></div>'
                );
                var metroLayout = ymaps.templateLayoutFactory.createClass(
                        '<div class="metro_block">' +
                        '</div>');
                var metroLayoutBlue = ymaps.templateLayoutFactory.createClass(
                        '<div class="metro_block">' +
                        '</div>');
                function doNormalBaloon(place) {
                        // place.options.set('iconLayout', squareLayout);
                }
                // Заполняем коллекцию данными.
                function scrollToMap(coords, myMap, place, btn, id)  {
                    var mapCenter = $('#points_map').offset().top,
                            header = $('header').height(),
                            summ = mapCenter - header - 20,
                            Mcoords = $(btn).data('mcoords');

                    $('html').animate({
                        scrollTop:summ
                    }, 1500, function() {
                        if(clickLast !== place && typeof clickLast !== 'undefined') {
                            doNormalBaloon(clickLast);
                        }
                        clickLast = place;
                        coordsPoint = coords;
                        place.balloon.open();
                        ymaps.geocode(coords, {
                            kind: 'metro',
                            results: 3
                        }).then(function (res) {
                            res.geoObjects.each(function (e) {
                                var block = e;
                                if(Mcoords === e.geometry.getCoordinates().join(',')) {
                                    e.options.set({
                                        'iconLayout': metroLayout,
                                        'closest': true,
                                        'iconShape': {
                                            type: 'Rectangle',
                                            // Прямоугольник описывается в виде двух точек - верхней левой и нижней правой.
                                            coordinates: [
                                                [-32,-32], [32, 32]
                                            ]
                                        },
                                    });
                                } else {
                                    e.options.set({
                                        'iconLayout': metroLayoutBlue,
                                        'closest': false,
                                        'iconShape': {
                                            type: 'Rectangle',
                                            // Прямоугольник описывается в виде двух точек - верхней левой и нижней правой.
                                            coordinates: [
                                                [-32,-32], [32, 32]
                                            ]
                                        },
                                    });
                                }
                                e.options.set({'balloonContentLayout': MyBalloonContentLayout2,'hideIconOnBalloonOpen': false});

                                e.events.add('balloonclose', function (e) {
                                    if(!block.options.get('closest')) {
                                        block.options.set('iconLayout', metroLayoutBlue);
                                    }
                                });
                                e.events.add('click',  function (e) {
                                    if (!block.balloon.isOpen()) {
                                        block.options.set('iconLayout', metroLayout);
                                    } else {
                                        block.options.set('iconLayout', metroLayoutBlue);
                                    }
                                })
                            })


                            // var myClusterTwo = new ymaps.Clusterer();//создаем кластер
                            // myClusterer.add(res.geoObjects);
                            // myMap.geoObjects.add(myClusterer);


                            myMap.geoObjects.add(res.geoObjects);
                            res.geoObjects.add(placemark);

                            // Масштабируем карту на область видимости коллекции.
                            var dotsCollection = res.geoObjects.getBounds();

                            myMap.setBounds(dotsCollection, {
                                checkZoomRange: true,
                                duration: 300,
                                zoomMargin: 35
                            });

                            if(typeof resArr === 'object') {
                                resArr.geoObjects.removeAll();
                            }

                            resArr = res;
                            $(document).on('click','.link_pano[data-id="'+id+'"]',function () {

                                res.geoObjects.removeAll();
                                place.balloon.close();
                                $(document).off('click', '.link_pano[data-id="'+id+'"]');
                                $(document).on('click','.link_pano[data-id="'+id+'"]',function () {
                                    if (!place.balloon.isOpen()) {
                                        scrollToMap(coords, myMap, place, btn, id);
                                    }
                                });
                            });
                        });
                    });
                }

                function metroPoint(coords, myMap, place, btn, id)  {
                    if(clickLast !== place && typeof clickLast !== 'undefined') {
                        doNormalBaloon(clickLast);
                    }
                    clickLast = place;
                    coordsPoint = coords;
                    place.events.group().events.types.click = undefined;
                    var  Mcoords = $('.link_pano[data-id="'+id+'"]').data('mcoords');
                    ymaps.geocode(coords, {
                        kind: 'metro',
                        results: 3
                    }).then(function (res) {
                        res.geoObjects.each(function (e) {
                            var block = e;
                            if(Mcoords === e.geometry.getCoordinates().join(',')) {
                                e.options.set({
                                    'iconLayout': metroLayout,
                                    'closest': true,
                                    'iconShape': {
                                        type: 'Rectangle',
                                        // Прямоугольник описывается в виде двух точек - верхней левой и нижней правой.
                                        coordinates: [
                                            [-32,-32], [32, 32]
                                        ]
                                    },
                                });
                            } else {
                                e.options.set({
                                    'iconLayout': metroLayoutBlue,
                                    'closest': false,
                                    'iconShape': {
                                        type: 'Rectangle',
                                        // Прямоугольник описывается в виде двух точек - верхней левой и нижней правой.
                                        coordinates: [
                                            [-32,-32], [32, 32]
                                        ]
                                    },
                                });
                            }
                            e.options.set({'balloonContentLayout': MyBalloonContentLayout2,'hideIconOnBalloonOpen': false});
                            e.events.add('balloonclose', function (e) {
                                if(!block.options.get('closest')) {
                                    block.options.set('iconLayout', metroLayoutBlue);
                                }
                            });

                            e.events.add(['click'],  function (e) {
                                if (!block.balloon.isOpen()) {
                                    block.options.set('iconLayout', metroLayout);
                                } else {
                                    block.options.set('iconLayout', metroLayoutBlue);
                                }
                            })
                        })



                        myMap.geoObjects.add(res.geoObjects);
                        res.geoObjects.add(placemark);

                        // Масштабируем карту на область видимости коллекции.
                        var oneCoord = coords[0];
                        var twoCoord = coords[1];
                        myMap.setCenter([oneCoord, twoCoord], 15, {
                            checkZoomRange: true,
                            duration: 600
                        });

                        if(typeof resArr === 'object') {
                            resArr.geoObjects.removeAll();
                        }
                        resArr = res;

                        place.events.add('click', function (e) {
                            var clickPlace = coords.join(','),
                                    lastPointPlace = coordsPoint.join(','),
                                    boolVal = clickPlace === lastPointPlace;
                            if (!place.balloon.isOpen() && boolVal) {
                            } else if(!place.balloon.isOpen() && !boolVal){
                                res.geoObjects.removeAll();
                                metroPoint(coords, myMap, place, this, id)
                            } else {
                                e.stopPropagation();
                            }
                        });
                    });
                }

                // var myClusterer = new ymaps.Clusterer();//создаем кластер

                var contentSens;
                if (myPoints !== null){
                for (var i = 0, l = myPoints.length; i < l; i++) {
                    var brand = '';
                    var sensors = myPoints[i]['sensors'];
                    if (sensors !== null) {
                    if (sensors !== undefined) {
                        for (var q = 0, j = sensors.length; q < j; q++) {
                            if (!oneSensor || oneSensor === 1) {
                                var oneSensor = sensors[q];
                                if (typeof oneSensor.temperature != "undefined"){
                                    contentSens = oneSensor.name + " " + oneSensor.temperature + "°" + "\n";
                                }
                            } else if (oneSensor && q === 1) {
                                var sensorTwo = sensors[q];
                                if (typeof sensorTwo.temperature != "undefined") {
                                    contentSens += sensorTwo.name + " " + sensorTwo.temperature + "°" + "\n";
                                }
                            } else if (oneSensor && q === 2) {
                                var sensorTree = sensors[q];
                                if (typeof sensorTree.temperature != "undefined") {
                                    contentSens += sensorTree.name + " " + sensorTree.temperature + "°" + "\n";
                                }
                            } else if (oneSensor && q === 3) {
                                var sensorFour = sensors[q];
                                if (typeof sensorFour.temperature != "undefined") {
                                    contentSens += sensorFour.name + " " + sensorFour.temperature + "°" + "\n";
                                }
                            } else if (oneSensor && q === 4) {
                                var sensorFive = sensors[q];
                                if (typeof sensorFive.temperature != "undefined") {
                                    contentSens += sensorFive.name + " " + sensorFive.temperature + "°" + "\n";
                                }
                            }
                        }
                    }
                }
                    if ( contentSens === undefined ) {
                        contentSens = [];
                    }

                    if (myPoints[i].brand_id === 1){
                        brand = "Букет столицы";
                        var squareLayout = ymaps.templateLayoutFactory.createClass('<div class="placemark_layout_container flex flex-column flex-center-vertical flex-center-horizontal">' +
                            '<div class="buket_layout">' +
                            '<span id="text3d-cb" class="font-blue-sharp shadow-obj">'+contentSens+'</span><i class="fa fa-circle-o font-blue-sharp shadow-obj" style="font-size:24px;background-color: white;border-radius: 50px;padding-bottom: 3px;padding-top: 3px;margin-top: -3px;"><p style="margin-left: 4.9px!important;" class="innerBrandText">БС</p></i><span class="map__title-block active font-blue-sharp"><p class="shadow-obj">'+myPoints[i].name+'</p></span></div></div>');
                    } else if (myPoints[i].brand_id === 2){
                        brand = "Клумба";
                        var squareLayout = ymaps.templateLayoutFactory.createClass('<div class="placemark_layout_container flex flex-column flex-center-vertical flex-center-horizontal">' +
                            '<div class="buket_layout">' +
                            '<span id="text3d-kl" class="font-red-haze shadow-obj">'+contentSens+'</span><i class="fa fa-circle-o font-red-haze shadow-obj" style="font-size:24px;background-color: white;border-radius: 50px;padding-bottom: 3px;padding-top: 3px;margin-top: -3px;" ><p style="margin-left: 4.4px!important;" class="innerBrandText">КЛ</p></i><span class="map__title-block active font-red-haze"><p class="shadow-obj">'+myPoints[i].name+'</p></span> </div></div>');
                    }else if (myPoints[i].brand_id === 3){
                        brand = "Пион";
                        var squareLayout = ymaps.templateLayoutFactory.createClass('<div class="placemark_layout_container flex flex-column flex-center-vertical flex-center-horizontal">' +
                            '<div class="buket_layout">' +
                            '<span id="text3d-pn" class="pion-color shadow-obj">'+contentSens+'</span><i class="fa fa-circle-o pion-color shadow-obj" style="font-size:24px;background-color: white;border-radius: 50px;padding-bottom: 3px;padding-top: 3px;margin-top: -3px;" ><p style="margin-left: 4px!important;" class="innerBrandText">ПН</p></i><span class="map__title-block active pion-color"><p class="shadow-obj">'+myPoints[i].name+'</p></span> </div></div>');
                    }else if (myPoints[i].brand_id === 4){
                        brand = "Флагман";
                        var squareLayout = ymaps.templateLayoutFactory.createClass('<div class="placemark_layout_container flex flex-column flex-center-vertical flex-center-horizontal">' +
                            '<div class="buket_layout">' +
                            '<span id="text3d-pn" class="font-green-meadow shadow-obj">'+contentSens+'</span><i class="fa fa-circle-o font-green-meadow shadow-obj" style="font-size:24px;background-color: white;border-radius: 50px;padding-bottom: 3px;padding-top: 3px;margin-top: -3px;"><p class="innerBrandText">ФЛ</p></i><span  class="map__title-block active font-green-meadow"><p class="shadow-obj">'+myPoints[i].name+'</p></span></div></div>');
                    }else if (myPoints[i].brand_id === 5){
                        brand = "Цветоbaza";
                        var squareLayout = ymaps.templateLayoutFactory.createClass(
                                '<div class="placemark_layout_container flex flex-column flex-center-vertical flex-center-horizontal">' +
                            '<div class="squareLayout">' +
                            '<span id="text3d-cb" class="font-green-turquoise shadow-obj">'+contentSens+'</span><i class="fa fa-circle-o font-green-turquoise shadow-obj" style="font-size:24px;background-color: white;border-radius: 50px;padding-bottom: 3px;padding-top: 3px;margin-top: -3px;"><p style="margin-left: 4.6px!important;" class="innerBrandText">ЦБ</p></i><span  class="font-green-turquoise map__title-block active"><p class="shadow-obj">'+myPoints[i].name+'</p></span></div></div>');
                    }else if (myPoints[i].brand_id === 6){
                        var squareLayout = ymaps.templateLayoutFactory.createClass('<div class="placemark_layout_container flex flex-column flex-center-vertical flex-center-horizontal">' +
                            '<div class="buket_layout">' +
                            '<span id="text3d-cb" class="font-blue-hoki shadow-obj">'+contentSens+'</span><i class="fa fa-circle-o font-blue-hoki shadow-obj" style=" font-size:24px;background-color: white;border-radius: 50px;padding-bottom: 3px;padding-top: 3px;margin-top: -3px;"><p style="margin-left: 3.3px!important;" class="innerBrandText">ФП</p></i><span class="font-blue-hoki map__title-block active"><p class="shadow-obj">'+myPoints[i].name+'</p></span></div></div>');
                        brand = "Flora Park";
                    }
                    contentSens = [];
                    oneSensor = 1;
                    sensorTwo = 2;
                    sensorTree = 3
                    sensorFour = 4;
                    sensorFive = 5;

                    var typeObject = '';
                    if (myPoints[i].type_object_id === 1){
                        typeObject = "Жилой дом"
                    } else if (myPoints[i].type_object_id === 2){
                        typeObject = "Нежилое помещение";
                    }else if (myPoints[i].type_object_id === 3){
                        typeObject = "Торговый павильон";
                    }else if (myPoints[i].type_object_id === 4){
                        typeObject = "Земельный участок";
                    }else if (myPoints[i].type_object_id === 5){
                        typeObject = "Жилое помещение";
                    }else if (myPoints[i].type_object_id === 6){
                        typeObject = "Прочее";
                    }

                    var typeUseObject = '';
                    if (myPoints[i].type_use_object_id === 1){
                        typeUseObject = "Аренда"
                    } else if (myPoints[i].type_use_object_id === 2){
                        typeUseObject = "Розничная точка";
                    }else if (myPoints[i].type_use_object_id === 3){
                        typeUseObject = "Прочее";
                    }

                    var content;
                    var phone = myPoints[i]['phones'];
                    if ( phone !== undefined ){
                    for (var z = 0, x = phone.length; z < x; z++) {
                        if (phone[z].object_type === 0){
                        if (!phoneOne || phoneOne === 1){
                            var phoneOne = phone[z];
                            if(phoneOne.phoneType === 2) {
                                content = '<p><span style="font-size: 13px;font-weight: normal;">' + phoneOne.phoneTitle + '</span>\n' +
                                        '                                  <a style="margin-left: 5px">' + phoneOne.phoneNumber + '</a></p>';
                            }else{
                                content = '<p><span style="font-size: 13px;font-weight: normal;">' + phoneOne.phoneTitle + '</span>\n' +
                                        '<a style="margin-left: 5px" href="https://api.whatsapp.com/send?phone=7'+phoneOne.phoneNumber.toString().replace('~\D+~','')+'">\n' +
                                        '                                  +7 ('+phoneOne.phoneNumber.toString().substr( 0, 3)+') '+phoneOne.phoneNumber.toString().substr( 3, 3)+'-'+phoneOne.phoneNumber.toString().substr( 6)+'</a>';
                            }

                        }else if (phoneOne && z === 1){
                            var phoneTwo = phone[z];
                            if(phoneTwo.phoneType === 2) {
                                content += '<p><span style="font-size: 13px;font-weight: normal;">' + phoneTwo.phoneTitle + '</span>\n' +
                                        '                                  <a style="margin-left: 5px">' + phoneTwo.phoneNumber + '</a></p>';
                            }else{
                                content += '<p><span style="font-size: 13px;font-weight: normal;">' + phoneTwo.phoneTitle + '</span>\n' +
                                        '<a style="margin-left: 5px" href="https://api.whatsapp.com/send?phone=7'+phoneTwo.phoneNumber.toString().replace('~\D+~','')+'">\n' +
                                        '                                  +7 ('+phoneTwo.phoneNumber.toString().substr( 0, 3)+') '+phoneTwo.phoneNumber.toString().substr( 3, 3)+'-'+phoneTwo.phoneNumber.toString().substr( 6)+'</a>';
                            }
                        }else if (phoneTwo && z === 2){
                            var phoneThree = phone[z];
                            if(phoneThree.phoneType === 2) {
                                content += '<p><span style="font-size: 13px;font-weight: normal;">' + phoneThree.phoneTitle + '</span>\n' +
                                        '                                  <a style="margin-left: 5px">' + phoneThree.phoneNumber + '</a></p>';
                            }else{
                                content += '<p><span style="font-size: 13px;font-weight: normal;">' + phoneThree.phoneTitle + '</span>\n' +
                                        '<a style="margin-left: 5px" href="https://api.whatsapp.com/send?phone=7'+phoneThree.phoneNumber.toString().replace('~\D+~','')+'">\n' +
                                        '                                  +7 ('+phoneThree.phoneNumber.toString().substr( 0, 3)+') '+phoneThree.phoneNumber.toString().substr( 3, 3)+'-'+phoneThree.phoneNumber.toString().substr( 6)+'</a>';
                            }
                        }else if (phoneThree && z === 3){
                            var phoneFour = phone[z];
                            if(phoneFour.phoneType === 2) {
                                content += '<p><span style="font-size: 13px;font-weight: normal;">' + phoneFour.phoneTitle + '</span>\n' +
                                        '                                  <a style="margin-left: 5px">' + phoneFour.phoneNumber + '</a></p>';
                            }else{
                                content += '<p><span style="font-size: 13px;font-weight: normal;">' + phoneFour.phoneTitle + '</span>\n' +
                                        '<a style="margin-left: 5px" href="https://api.whatsapp.com/send?phone=7'+phoneFour.phoneNumber.toString().replace('~\D+~','')+'">\n' +
                                        '                                  +7 ('+phoneFour.phoneNumber.toString().substr( 0, 3)+') '+phoneFour.phoneNumber.toString().substr( 3, 3)+'-'+phoneFour.phoneNumber.toString().substr( 6)+'</a>';
                            }
                        }else if (phoneFour && z === 4){
                            if(phone[z].phoneType === 2) {
                                content += '<p><span style="font-size: 13px;font-weight: normal;">' + phone[z].phoneTitle + '</span>\n' +
                                        '                                  <a style="margin-left: 5px">' + phone[z].phoneNumber + '</a></p>';
                            }else{
                                content += '<p><span style="font-size: 13px;font-weight: normal;">' + phone[z].phoneTitle + '</span>\n' +
                                        '<a style="margin-left: 5px" href="https://api.whatsapp.com/send?phone=7'+phone[z].phoneNumber.toString().replace('~\D+~','')+'">\n' +
                                        '                                  +7 ('+phone[z].phoneNumber.toString().substr( 0, 3)+') '+phone[z].phoneNumber.toString().substr( 3, 3)+'-'+phone[z].phoneNumber.toString().substr( 6)+'</a>';
                            }
                        }
                        }
                    }
                    }

                        var point = myPoints[i],
                            placemark = new ymaps.Placemark(
                                point.coords, {
                                    hideIconOnBalloonOpen: false,
                                    balloonContentHeader: '<h3 class="stores-map">' + point.name + '</h3>',
                                    balloonContentBody:
                                        '<p><span style="font-weight: 600">Бренд</span><br><a class="toObject" href="/points?param=brand_id&amp;value=' + point.brand_id + '">' + brand + '</a></p>' +
                                        '<p><span style="font-weight: 600">Тип обЪекта</span><br><a class="toObject" href="/points?param=type_object_id&amp;value=' + point.type_object_id + '">' + typeObject + '</a></p>' +
                                        '<p><span style="font-weight: 600">Использование</span><br><a class="toObject" href="/points?param=type_use_object_id&value=' + point.type_use_object_id + '" class="margin-left-15">' + typeUseObject + '</a></p>'+
                                        '<p><span style="font-weight: 600">Контакты</span><br><p>'+content+'</p>',
                                    balloonContent: point.city + ', ' + point.street + ', ' + point.building,
                                    hintContent: brand + ', ' + point.name + ' ' + point.city + ', ' + point.street + ', ' + point.building
                                }, {
                                    iconLayout: squareLayout,
                                    iconShape: {
                                        type: 'Circle',
                                        // Круг описывается в виде центра и радиуса
                                        coordinates: [0, 0],
                                        radius: 25
                                    },
                                    hideIconOnBalloonOpen: false
                                }
                            );

                    content = [];
                    phoneOne = 1;
                    phoneTwo = 2;
                    phoneThree = 3
                    phoneFour = 4;

                    var MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
                            '<div class="popover-content-map popover-content flex flex-center-vertical">' +
                            '<div>$[properties.balloonContentHeader]$[properties.balloonContentBody]<p>$[properties.balloonContent]</p></div>' +
                            '<div class="baloonClose">' +
                            '<i style="font-size: 20px;padding: 12px 7px;" class="fal fa-times"></i>' +
                            '</div>' +
                            '</div>'
                            , {
                                build: function () {
                                    MyBalloonContentLayout.superclass.build.call(this);
                                    $(".baloonClose").click(function(){
                                        if(place.balloon.isOpen()) {
                                            place.balloon.close();
                                        }
                                    });
                                }
                            });

                    placemark.options.set({
                        balloonContentLayout: MyBalloonContentLayout,
                        balloonLayout: MyBalloonContentLayout
                    });

                    let place = placemark,
                            coords = point.coords,
                            id = point.id;
                    place.events.add('click', function (e) {//клик по метке
                        if (!place.balloon.isOpen()) {
                            metroPoint(coords,myMap,place,this,id);
                        }
                    });

                    $(document).on('click','.link_pano[data-id="'+id+'"]',function () {
                        if (!place.balloon.isOpen()) {
                            scrollToMap(coords, myMap, place, this, id);
                        }
                        $(document).off('click', '.link_pano[data-id="'+id+'"]');
                    });

                    place.events.add('balloonclose', function (e) {//закрытие балуна
                        if(clickLast !== place) {
                            doNormalBaloon(place);
                        }
                        myMap.setBounds(myMap.geoObjects.getBounds(),{
                            checkZoomRange: true,
                            duration: 600,
                            zoomMargin: 35
                        });
                    });
                     myCollection.add(placemark); //вариант без кластера
                    // myClusterer.add(placemark);
                }
                }
                myMap.events.add('balloonopen', function (e, el) {//открытие балуна
                    var balloon = e;
                    myMap.events.add('click', function (e) {
                        if(e.get('target') === myMap) { // Если клик был на карте, а не на геообъекте
                            myMap.balloon.close();
                        }
                    });
                });
                $(document).on('click', '.metro_href', function (e) {
                    e.preventDefault();
                    $(this).closest('.link_pano').trigger('click');
                })


                // Добавляем коллекцию меток на карту.
                 myMap.geoObjects.add(myCollection);//вариант без кластера
                // myMap.geoObjects.add(myClusterer);
                myMap.behaviors.enable('scrollZoom');

                // Создаем экземпляр класса ymaps.control.SearchControl
                var mySearchControl = new ymaps.control.SearchControl({
                    options: {
                        // Заменяем стандартный провайдер данных (геокодер) нашим собственным.
                        provider: new CustomSearchProvider(myPoints),
                        // Не будем показывать еще одну метку при выборе результата поиска,
                        // т.к. метки коллекции myCollection уже добавлены на карту.
                        noPlacemark: true,
                        resultsPerPage: 5
                    }});

                // Добавляем контрол в верхний правый угол,
                myMap.controls
                        .add(mySearchControl, { right: 10, top: 10 });
                myMap.setBounds(myMap.geoObjects.getBounds(),{
                        checkZoomRange: true,
                        duration: 600,
                        zoomMargin: 35
                    });//авто масштабирование в зависимости от меток
                // myMap.margin.setDefaultMargin(50);
            });

            // Провайдер данных для элемента управления ymaps.control.SearchControl.
            // Осуществляет поиск геообъектов в по массиву points.
            // Реализует интерфейс IGeocodeProvider.
            function CustomSearchProvider(points) {
                this.points = points;
            }

            // Провайдер ищет по полю text стандартным методом String.ptototype.indexOf.
            CustomSearchProvider.prototype.geocode = function (request, options) {
                var deferred = new ymaps.vow.defer(),
                        geoObjects = new ymaps.GeoObjectCollection(),
                        // Сколько результатов нужно пропустить.
                        offset = options.skip || 0,
                        // Количество возвращаемых результатов.
                        limit = options.results || 20;
                var points = [];
                // Ищем в свойстве text каждого элемента массива.
                for (var i = 0, l = this.points.length; i < l; i++) {
                    var point = this.points[i];
                    var adres = point.city + ',' + point.street + ',' + point.building;
                    if (point.name.toLowerCase().indexOf(request.toLowerCase()) != -1 || adres.toLowerCase().indexOf(request.toLowerCase()) != -1) {
                        points.push(point);
                    }
                }
                // При формировании ответа можно учитывать offset и limit.
                points = points.splice(offset, limit);
                // Добавляем точки в результирующую коллекцию.
                for (var i = 0, l = points.length; i < l; i++) {
                    var point = points[i],
                            coords = point.coords,
                            name = point.name,
                            adres = point.city + ',' + point.street + ',' + point.building,
                            street = point.street;

                    geoObjects.add(new ymaps.Placemark(coords, {
                        name: name + '',
                        description: adres + '',
                        boundedBy: [coords, coords]
                    }));
                }

                deferred.resolve({
                    // Геообъекты поисковой выдачи.
                    geoObjects: geoObjects,
                    // Метаинформация ответа.
                    metaData: {
                        geocoder: {
                            // Строка обработанного запроса.
                            request: request,
                            // Количество найденных результатов.
                            found: geoObjects.getLength(),
                            // Количество возвращенных результатов.
                            results: limit,
                            // Количество пропущенных результатов.
                            skip: offset
                        }
                    }
                });

                // Возвращаем объект-обещание.
                return deferred.promise();
            };
            }
        },
        error: function(jqXHR, textStatus, errorThrown, data){
             alert('error!' +' '+ textStatus +' '+ data);
            console.log(data);
        }
    })
}
