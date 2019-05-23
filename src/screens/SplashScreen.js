import React, {Component} from 'react';
import {View, AsyncStorage, StyleSheet, Text, Animated, PermissionsAndroid} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {connect} from 'react-redux';

import {setLocation, setAddress, setWeather} from '../store/actions/index';
import {googleMapsKey, openWeatherKey} from '../../config/keys';

class SplashScreen extends Component {
    state_loc = {
        logoOp : new Animated.Value(0),
    }

    async componentWillMount() {
        this.animatedValue = new Animated.Value(0);
    }

    performTimeConsumingTask = async() => {
        return new Promise((resolve) =>
            setTimeout (
                () => {resolve('result')},
                2000
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
        const loc = this.getLocation();
        //const addr = this.getAddressFromGoogleApi();
        const data = await this.performTimeConsumingTask();
        if(data!==null&&loc!==null) {
            this.props.navigation.navigate('App');
        }
    }

    async getLocation() {
        const LocationPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if(LocationPermission === PermissionsAndroid.RESULTS.GRANTED) {
            Geolocation.getCurrentPosition(
                (position) => {
                    this.props.onSetLocation(position.coords);
                    this.getAddressFromGoogleApi();
                    this._getWeather();
                },
                (error) => {
                    console.log(error.code, error.message);
                },
                {enableHighAccuracy:true, timeout:15000, maximumAge:10000}
            );
            return LocationPermission;
        }
        return null;
    }
    

    async getAddressFromGoogleApi() {
        const api = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';
        const latitude = this.props.location.latitude;
        const longitude = this.props.location.longitude;
        console.log(googleMapsKey);
        let apiRequestUrl = api + latitude + ',' + longitude + '&key=' + googleMapsKey;

        try {
            let response = await fetch(apiRequestUrl);
            let responseJson = await response.json();
            this.props.onSetAddress(responseJson);
            console.log(responseJson);
            return responseJson;
        }
        catch (error) {
            console.error(error);
        }
    }

    _getWeather = () => {
        latitude = this.props.location.latitude;
        longitude = this.props.location.longitude;
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeatherKey}`)
            .then(response => response.json()) // 응답값을 json으로 변환
            .then(json => {
                this.props.onSetWeather(json);
            }
        );
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
                    <Text style={styles.titleText}>
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
    titleText: {
        fontSize : 20,
        fontFamily : "LogoENG-Medium",
        color : '#00C1DE',
    },
});

const mapStateToProps = state => {
    return {
        location: state.geoloc.location,
        address: state.geoloc.address,
        weather: state.weather.weather,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onSetLocation: (location) => dispatch(setLocation(location)),
        onSetAddress : (address) => dispatch(setAddress(address)),
        onSetWeather : (weather) => dispatch(setWeather(weather)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SplashScreen);