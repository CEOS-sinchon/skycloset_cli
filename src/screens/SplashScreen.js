import React, {Component} from 'react';
import {View, AsyncStorage, StyleSheet, Text, Animated, PermissionsAndroid} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {connect} from 'react-redux';

import {setLatitude, setLongitude, setAddress, setWeather0, setWeather1, setWeather2, setWeather3, setCurrentWeather, setTmX, setTmY, setDust, setDist} from '../store/actions/index';
import {googleMapsKey, darkSkyKey, sgisKey_ID, sgisKey_SECRET, airkoreaKey} from '../../config/keys';

class SplashScreen extends Component {
    state_loc = {
        logoOp : new Animated.Value(0),
    }

    async componentWillMount() {
        this.animatedValue = new Animated.Value(0);
        this.getLocation();
    }

    performTimeConsumingTask = async() => {
        return new Promise((resolve) =>
            setTimeout (
                () => {resolve('result')},
                2500
            )    
        );
    }

    async componentDidMount() {
        this._logoFadeIn();
        Animated.timing(this.animatedValue, {
            toValue: 150,
            duration: 400,
            delay:800,
        }).start();
        
        //this.getAddressFromGoogleApi();
        //this._getWeather();
        //const addr = this.getAddressFromGoogleApi();
        const data = await this.performTimeConsumingTask();
        if(data!==null) {
            this.props.navigation.navigate('App');
        }
    }

    async getLocation() {
        const LocationPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if(LocationPermission === PermissionsAndroid.RESULTS.GRANTED) {
            Geolocation.getCurrentPosition(
                (position) => {
                    this.props.onSetLatitude(position.coords.latitude);
                    this.props.onSetLongitude(position.coords.longitude);
                    this.getAddressFromGoogleApi();
                    this._getWeather();
                    return LocationPermission;
                },
                (error) => {
                    console.log(error.code, error.message);
                },
                {enableHighAccuracy:true, timeout:15000, maximumAge:10000}
            );
        }
        return null;
    }
    

    async getAddressFromGoogleApi() {
        const api = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';
        const latitude = this.props.latitude;
        const longitude = this.props.longitude;
        console.log(googleMapsKey);
        let apiRequestUrl = api + latitude + ',' + longitude + '&language=ko&key=' + googleMapsKey;

        try {
            let response = await fetch(apiRequestUrl);
            let responseJson = await response.json();
            const address =  responseJson.results[0].address_components[2].long_name + ' ' + responseJson.results[0].address_components[1].long_name
            this.props.onSetAddress(address);
            console.log(responseJson);
            return responseJson;
        }
        catch (error) {
            console.error(error);
        }
    }

    _getWeather = () => {
        latitude = this.props.latitude;
        longitude = this.props.longitude;
        todayTime = Math.floor(new Date().getTime() / 1000);
        yesterTime = todayTime - 86400;
        
        fetch(`https://api.darksky.net/forecast/${darkSkyKey}/${latitude},${longitude}?exclude=minutely,alerts,flags&units=si`)
            .then(response => response.json()) // 응답값을 json으로 변환
            .then(json => {
                this.props.onSetCurrentWeather({
                    currentTemp :json.currently.temperature,
                    currentHum : json.currently.humidity,
                    currentWs : json.currently.windSpeed,
                    currentIcon : json.currently.icon,
                });
                this.props.onSetWeather1({
                    tempMin : json.daily.data[0].temperatureMin,
                    tempMax : json.daily.data[0].temperatureMax,
                    tempMinApparent : json.daily.data[0].apparentTemperatureMin,
                    tempMaxApparent : json.daily.data[0].apparentTemperatureMax,
                    humidity : json.daily.data[0].humidity,
                    windSpeed : json.daily.data[0].windSpeed,
                    icon : json.daily.data[0].icon,
                    cloudCover : json.daily.data[0].cloudCover,
                });
                this.props.onSetWeather2({
                    tempMin : json.daily.data[1].temperatureMin,
                    tempMax : json.daily.data[1].temperatureMax,
                    tempMinApparent : json.daily.data[1].apparentTemperatureMin,
                    tempMaxApparent : json.daily.data[1].apparentTemperatureMax,
                    humidity : json.daily.data[1].humidity,
                    windSpeed : json.daily.data[1].windSpeed,
                    icon : json.daily.data[1].icon,
                    cloudCover : json.daily.data[1].cloudCover,
                });
                this.props.onSetWeather3({
                    tempMin : json.daily.data[2].temperatureMin,
                    tempMax : json.daily.data[2].temperatureMax,
                    tempMinApparent : json.daily.data[2].apparentTemperatureMin,
                    tempMaxApparent : json.daily.data[2].apparentTemperatureMax,
                    humidity : json.daily.data[2].humidity,
                    windSpeed : json.daily.data[2].windSpeed,
                    icon : json.daily.data[2].icon,
                    cloudCover : json.daily.data[2].cloudCover,
                });
            })
            .then(fetch(`https://api.darksky.net/forecast/${darkSkyKey}/${latitude},${longitude},${yesterTime}?exclude=currently,minutely,hourly,alerts,flags&units=si&lang=ko`)
                .then(response2 => response2.json()) // 응답값을 json으로 변환
                .then(json2 => {
                    this.props.onSetWeather0({
                        tempMin : json2.daily.data[0].temperatureMin,
                        tempMax : json2.daily.data[0].temperatureMax,
                        tempMinApparent : json2.daily.data[0].apparentTemperatureMin,
                        tempMaxApparent : json2.daily.data[0].apparentTemperatureMax,
                        humidity : json2.daily.data[0].humidity,
                        windSpeed : json2.daily.data[0].windSpeed,
                        icon : json2.daily.data[0].icon,
                        cloudCover : json2.daily.data[0].cloudCover,
                    });
                })
            )
            .then(fetch(`https://sgisapi.kostat.go.kr/OpenAPI3/auth/authentication.json?consumer_key=${sgisKey_ID}&consumer_secret=${sgisKey_SECRET}`)
                .then(response3 => response3.json()) // 응답값을 json으로 변환
                .then(json3 => {
                    fetch(`https://sgisapi.kostat.go.kr/OpenAPI3/transformation/transcoord.json?accessToken=${json3.result.accessToken}&src=4326&dst=5181&posX=${longitude}&posY=${latitude}`)
                    .then(response4 => response4.json())
                    .then(json4 => {
                        console.log(json4);
                        this.props.onSetTmX(json4.result.posX);
                        this.props.onSetTmY(json4.result.posY);
                        fetch(`http://openapi.airkorea.or.kr/openapi/services/rest/MsrstnInfoInqireSvc/getNearbyMsrstnList?serviceKey=${airkoreaKey}&tmX=${json4.result.posX}&tmY=${json4.result.posY}&_returnType=json`)
                        .then(response5 => response5.json())
                        .then(json5 => {
                            this.props.onSetDist(json5.list[0].tm);
                            fetch(`http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?stationName=${json5.list[0].stationName}&dataTerm=daily&ServiceKey=${airkoreaKey}&ver=1.0&_returnType=json`)
                            .then(response6 => response6.json())
                            .then(json6 => {
                                this.props.onSetDust(json6.list[0]);
                            })
                        })
                    })
                })
            )
    }

    _logoFadeIn() {
        Animated.timing(this.state_loc.logoOp, {
            toValue: 1,
            duration: 300,
            delay:200,
        }).start();
    }

    _getLogoStyle() {
        return {
            width: 128, height:128,
            opacity: this.state_loc.logoOp,
        }
    }

    _bootstrapAsync = async() => {
        const userToken = await AsyncStorage.getItem('userToken');
        this.props.navigation.navigate(userToken ? 'App' : 'Auth');
    };

    render() {
        const interpolateColor = this.animatedValue.interpolate({
            inputRange: [0, 150],
            outputRange: ['rgb(0, 193, 222)', 'rgb(255, 255, 255)']
        })
        const animiatedStyle = {
            backgroundColor: interpolateColor
        }
        return (
            <Animated.View style={[styles.container, animiatedStyle]}>
                <View style={styles.logoContainer}>
                    <Animated.Image
                        style={this._getLogoStyle()}
                        source={require('../assets/images/logo.png')}
                    />
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.titleTextKOR}>
                        하늘 옷장
                    </Text>
                    <Text style={styles.titleTextENG}>
                        SKY CLOSET
                    </Text>
                </View>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        height: '70%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleContainer: {
        height: '30%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleTextKOR: {
        fontSize : 23,
        fontFamily : "LogoKOR-Medium",
        color : '#00C1DE',
        marginBottom : 10,
    },
    titleTextENG: {
        fontSize : 20,
        fontFamily : "LogoENG-Medium",
        color : '#00C1DE',
    },
});

const mapStateToProps = state => {
    return {
        latitude: state.geoloc.latitude,
        longitude: state.geoloc.longitude,
        address: state.geoloc.address,
        tm_x : state.geoloc.tm_x,
        tm_y : state.geoloc.tm_y,
        weather0: state.weather.weather0,
        weather1: state.weather.weather1,
        weather2: state.weather.weather2,
        weather3: state.weather.weather3,
        currentBias : state.current.currentBias,
        currentGender : state.current.currentGender,
        currentWeather : state.current.currentWeather,
        dust : state.dust.dust,
        dist : state.dust.dist,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onSetLatitude: (latitude) => dispatch(setLatitude(latitude)),
        onSetLongitude: (longitude) => dispatch(setLongitude(longitude)),
        onSetAddress : (address) => dispatch(setAddress(address)),
        onSetTmX : (tm_x) => dispatch(setTmX(tm_x)),
        onSetTmY : (tm_y) => dispatch(setTmY(tm_y)),
        onSetWeather0 : (weather0) => dispatch(setWeather0(weather0)),
        onSetWeather1 : (weather1) => dispatch(setWeather1(weather1)),
        onSetWeather2 : (weather2) => dispatch(setWeather2(weather2)),
        onSetWeather3 : (weather3) => dispatch(setWeather3(weather3)),
        onSetCurrentBias : (currentBias) => dispatch(setCurrentBias(currentBias)),
        onSetCurrentGender : (currentGender) => dispatch(setCurrentGender(currentGender)),
        onSetCurrentWeather : (currentWeather) => dispatch(setCurrentWeather(currentWeather)),
        onSetDust : (dust) => dispatch(setDust(dust)),
        onSetDist : (dist) => dispatch(setDist(dist)),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(SplashScreen);