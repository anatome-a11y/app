const fs = require('fs');
const path = require('path');

const files = [
    'node_modules/react-native-nfc-manager/android/build.gradle',
    'node_modules/react-native-voice/android/build.gradle',
];

const replacement = [
    'repositories {',
    "        maven { url 'https://maven.google.com/' }",
    '        mavenCentral()',
    "        maven { url 'https://maven.aliyun.com/repository/public' }",
    '    }',
].join('\n');

files.forEach(relativePath => {
    const file = path.join(__dirname, '..', relativePath);
    if (!fs.existsSync(file)) {
        return;
    }
    const source = fs.readFileSync(file, 'utf8');
    const next = source.replace(/repositories\s*\{\s*jcenter\(\)\s*\}/g, replacement);
    if (next !== source) {
        fs.writeFileSync(file, next);
    }
});

const accessibilityGradle = path.join(__dirname, '..', 'node_modules/react-native-accessibility/android/build.gradle');
if (fs.existsSync(accessibilityGradle)) {
    fs.writeFileSync(accessibilityGradle, [
        "apply plugin: 'com.android.library'",
        '',
        'android {',
        '    compileSdkVersion 27',
        '    buildToolsVersion "27.0.2"',
        '',
        '    defaultConfig {',
        '        minSdkVersion 16',
        '        targetSdkVersion 26',
        '        versionCode 1',
        '        versionName "1.0"',
        '    }',
        '    lintOptions {',
        '        abortOnError false',
        '    }',
        '}',
        '',
        'repositories {',
        '    mavenCentral()',
        "    maven { url 'https://maven.google.com/' }",
        "    maven { url 'https://maven.aliyun.com/repository/public' }",
        '    maven { url "$rootProject.projectDir/../node_modules/react-native/android" }',
        '}',
        '',
        'dependencies {',
        "    compile 'com.facebook.react:react-native:0.55.4'",
        '}',
        '',
    ].join('\n'));
}

const accessibilityJava = path.join(
    __dirname,
    '..',
    'node_modules/react-native-accessibility/android/src/main/java/com/reactlibrary/RNReactNativeAccessibilityModule.java'
);
if (fs.existsSync(accessibilityJava)) {
    const source = fs.readFileSync(accessibilityJava, 'utf8');
    const next = source
        .replace('import android.support.v4.view.accessibility.AccessibilityEventCompat;\r\n', '')
        .replace('import android.support.v4.view.accessibility.AccessibilityEventCompat;\n', '')
        .replace('AccessibilityEventCompat.TYPE_ANNOUNCEMENT', 'AccessibilityEvent.TYPE_ANNOUNCEMENT');
    if (next !== source) {
        fs.writeFileSync(accessibilityJava, next);
    }
}

const audioGradle = path.join(__dirname, '..', 'node_modules/react-native-audio/android/build.gradle');
if (fs.existsSync(audioGradle)) {
    const source = fs.readFileSync(audioGradle, 'utf8');
    const next = source.replace(
        "compile 'com.android.support:appcompat-v7:${supportVersion}'",
        'compile "com.android.support:appcompat-v7:${supportVersion}"'
    );
    if (next !== source) {
        fs.writeFileSync(audioGradle, next);
    }
}
