/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    TouchableOpacity,
    TextInput,
} from 'react-native';

import {WebView} from 'react-native-webview';
import RNFetchBlob from 'rn-fetch-blob';
import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import DocumentPicker from 'react-native-document-picker';

import axios from 'axios';

import {
    chunkSizeDefault,
    chunkMaxSize,
    statusFileOperation,
    FieldFiles,
    conversionRateUnitData,
    endPoints,
    WebviewLayout,
} from './const';

const dataProps = {
    bandwidth: 1024 ** 2,
};

function App() {
    const isDarkMode = useColorScheme() === 'dark';

    const [statusFiles, setStatusFiles] = React.useState({});
    let [counter, setCounter] = React.useState(1);

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const chunkSize =
        dataProps?.bandwidth >= chunkSizeDefault &&
        dataProps?.bandwidth <= chunkMaxSize
            ? dataProps?.bandwidth
            : chunkSizeDefault;

    let fileSend;
    let nameFile;

    const callApiUpload = async contenFile => {
        await axios
            .post(
                endPoints.uploadChunkBase64,
                {
                    fileSend: contenFile,
                    nameFile,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            )
            .then(res => {
                const {data} = res.data;
                console.log('data: ', data);
            })
            .catch(err => {
                console.log('err: ', err);
            });
    };

    const handleUpload = async () => {
        const str1 = fileSend.slice(0, 5000);
        const str2 = fileSend.slice(5000, -1);

        await callApiUpload(str1);
        await callApiUpload(str2);
    };

    return (
        <SafeAreaView style={backgroundStyle}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundStyle.backgroundColor}
            />

            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={backgroundStyle}>
                <Header />

                <TouchableOpacity
                    style={styles.buttonStyle}
                    activeOpacity={0.5}
                    onPress={async () => {
                        try {
                            const pickerResult = await DocumentPicker.pick({
                                presentationStyle: 'fullScreen',
                                // copyTo: 'cachesDirectory',
                                allowMultiSelection: true,
                            });

                            /*
                            [
                                {"fileCopyUri": "file:///Users/longle/Library/Developer/CoreSimulator/Devices/1D01E050-0EC0-4C4A-AE24-928726948793/data/Containers/Data/Application/051B0417-D539-4303-B533-9DD913C139C8/Library/Caches/916E3143-0D07-4538-BD61-72581533BA74/eduardo-bergen-a1V5iA9UTDc-unsplash.jpg", "name": "eduardo-bergen-a1V5iA9UTDc-unsplash.jpg", "size": 2552150, "type": "image/jpeg", "uri": "file:///Users/longle/Library/Developer/CoreSimulator/Devices/1D01E050-0EC0-4C4A-AE24-928726948793/data/Containers/Data/Application/051B0417-D539-4303-B533-9DD913C139C8/tmp/org.reactjs.native.example.rnHasaki-Inbox/eduardo-bergen-a1V5iA9UTDc-unsplash.jpg"}, 
                                
                                {"fileCopyUri": "file:///Users/longle/Library/Developer/CoreSimulator/Devices/1D01E050-0EC0-4C4A-AE24-928726948793/data/Containers/Data/Application/051B0417-D539-4303-B533-9DD913C139C8/Library/Caches/21A02E6E-98F9-4E4F-9972-AA6EF4DB5E76/joban-khangura-VdL_VPHug-k-unsplash.jpg", "name": "joban-khangura-VdL_VPHug-k-unsplash.jpg", "size": 3578321, "type": "image/jpeg", "uri": "file:///Users/longle/Library/Developer/CoreSimulator/Devices/1D01E050-0EC0-4C4A-AE24-928726948793/data/Containers/Data/Application/051B0417-D539-4303-B533-9DD913C139C8/tmp/org.reactjs.native.example.rnHasaki-Inbox/joban-khangura-VdL_VPHug-k-unsplash.jpg"}
                            ]
                        */
                            // console.log('pickerResult: ', pickerResult)
                            const filePath = pickerResult[0].uri.replace(
                                'file:',
                                '',
                            );
                            const getType = pickerResult[0].type;
                            const getName = pickerResult[0].name;

                            nameFile = getName;

                            fileSend = `data:${getType};base64,`;
                            await RNFetchBlob.fs
                                .readFile(filePath, 'base64')
                                .then(data => {
                                    fileSend += data;
                                })
                                .catch(err => {
                                    console.log('err: ', err);
                                });

                            // const statusFiles = statusFileOperation(blobFile, chunkSize);
                            // setStatusFiles(statusFiles);
                        } catch (e) {
                            console.log('e: ', e);
                        }
                    }}>
                    <Text style={styles.buttonTextStyle}>Select File</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonStyle}
                    activeOpacity={0.5}
                    onPress={handleUpload}>
                    <Text style={styles.buttonTextStyle}>Upload Files</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
    buttonStyle: {
        backgroundColor: '#307ecc',
        borderWidth: 0,
        color: '#FFFFFF',
        borderColor: '#307ecc',
        height: 40,
        alignItems: 'center',
        borderRadius: 30,
        marginLeft: 35,
        marginRight: 35,
        marginTop: 15,
    },
    buttonTextStyle: {
        color: '#FFFFFF',
        paddingVertical: 10,
        fontSize: 16,
        alignContent: 'center',
    },
});

export default App;
