const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/views/webview/ReactWebViewManager.java');

if (!fs.existsSync(file)) {
    process.exit(0);
}

let source = fs.readFileSync(file, 'utf8');

const anchor = 'webView.getSettings().setDomStorageEnabled(true);';
if (source.indexOf('setOnTouchListener') === -1 && source.indexOf(anchor) !== -1) {
    const bloco = [
        anchor,
        '',
        '        // O gesto vertical no modelo não pode rolar o ScrollView pai.',
        '        webView.setOnTouchListener(new android.view.View.OnTouchListener() {',
        '            @Override',
        '            public boolean onTouch(android.view.View view, android.view.MotionEvent event) {',
        '                if (view.getParent() != null) {',
        '                    int action = event.getActionMasked();',
        '                    boolean mover = action == android.view.MotionEvent.ACTION_DOWN',
        '                            || action == android.view.MotionEvent.ACTION_POINTER_DOWN',
        '                            || action == android.view.MotionEvent.ACTION_MOVE;',
        '                    view.getParent().requestDisallowInterceptTouchEvent(mover);',
        '                }',
        '                return false;',
        '            }',
        '        });',
    ].join('\n');
    source = source.replace(anchor, bloco);
}

const construtor = 'public ReactWebView(ThemedReactContext reactContext) {\n      super(reactContext);\n    }';
if (source.indexOf('public boolean onTouchEvent') === -1 && source.indexOf(construtor) !== -1) {
    const metodo = construtor + [
        '',
        '',
        '    @Override',
        '    public boolean onTouchEvent(android.view.MotionEvent event) {',
        '      if (getParent() != null) {',
        '        int action = event.getActionMasked();',
        '        boolean gesto = action == android.view.MotionEvent.ACTION_DOWN',
        '            || action == android.view.MotionEvent.ACTION_POINTER_DOWN',
        '            || action == android.view.MotionEvent.ACTION_MOVE;',
        '        getParent().requestDisallowInterceptTouchEvent(gesto);',
        '      }',
        '      return super.onTouchEvent(event);',
        '    }',
    ].join('\n');
    source = source.replace(construtor, metodo);
}

fs.writeFileSync(file, source);
