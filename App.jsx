import React, {useState} from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    TouchableOpacity,
} from 'react-native';

import RNFetchBlob from 'rn-fetch-blob';
import {Colors, Header} from 'react-native/Libraries/NewAppScreen';
import DocumentPicker from 'react-native-document-picker';

import axios from 'axios';

let fileSend = '';
let nameFile = '';
let typeFile = '';

// local: 'http://localhost:1323/api/v1/files/upload-chunks-base64'
// link: 'https://wshr.inshasaki.com/upload/api/v1/files/upload-chunks-base64'

function App() {
    const isDarkMode = useColorScheme() === 'dark';

    const fileNumber = 'randomText' + '_fileNumber_1'; // NOTE NOTE NOTE: different fileNumber for each file

    let [retryAt, setRetryAt] = useState(-1);

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const callApiUpload = async (
        contenFile,
        fileNumber,
        chunkNumber,
        totalChunk,
        typeFile,
        retry,
        retryIsLast,
    ) => {
        await axios
            .post(
                'https://wshr.inshasaki.com/upload/api/v1/files/upload-chunks-base64',
                {
                    chunk: contenFile,
                    file_name: nameFile,
                    file_number: fileNumber,
                    chunk_number: chunkNumber,
                    total_chunk: totalChunk,
                    type_file: typeFile,
                    retry: retry,
                    retry_is_last: retryIsLast,
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
                setRetryAt(Number(chunkNumber));
            });
    };

    const handleUpload = async () => {
        const divisionFile = Math.ceil(fileSend.length / 3);

        const part2 = divisionFile * 2;

        const str1 = fileSend.slice(0, divisionFile);
        const str2 = fileSend.slice(divisionFile, part2);
        const str3 = fileSend.slice(part2, -1);

        /**
         * @param str1: content file had slice
         * @param fileNumber: unique, file's name in the list files upload
         * @param chunkNumber: the order chunk file upload
         * @param totalChunk: total of chunks
         * @param typeFile: type file (image/png)
         * @param retry: true if call api again from previous chunk got errors
         * @param retryIsLast: true if call api again from previous chunk got errors and it is the last chunk
         */
        await callApiUpload(str1, fileNumber, 1, 3, typeFile, false, false);

        await callApiUpload(str2, fileNumber, 2, 3, typeFile, false, false);
        await callApiUpload(str3, fileNumber, 3, 3, typeFile, false, false);
    };

    const handleRetryFile = async () => {
        const divisionFile = Math.ceil(fileSend.length / 3);

        const from = divisionFile * (retryAt - 1);
        let end = divisionFile * retryAt;
        if (retryAt === 3) {
            end = -1;
        }

        const contenRetry = fileSend.slice(from, end);

        console.log('fileNumber: ', fileNumber);
        await callApiUpload(
            contenRetry,
            fileNumber,
            retryAt,
            3,
            typeFile,
            true,
            true,
        );
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
                                copyTo: 'cachesDirectory',
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

                            fileSend = '';
                            typeFile = getType;
                            nameFile = getName;
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

                {retryAt >= 0 && (
                    <TouchableOpacity
                        style={styles.buttonStyle}
                        activeOpacity={0.5}
                        onPress={handleRetryFile}>
                        <Text style={styles.buttonTextStyle}>Retry Files</Text>
                    </TouchableOpacity>
                )}
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
