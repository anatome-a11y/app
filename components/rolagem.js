const scrolls = [];

export const registrarRolagem = ref => {
    if (ref && scrolls.indexOf(ref) === -1) {
        scrolls.push(ref);
    }
};

export const soltarRolagem = ref => {
    const indice = scrolls.indexOf(ref);
    if (indice !== -1) {
        scrolls.splice(indice, 1);
    }
};

export const travarRolagem = travar => {
    scrolls.forEach(scroll => {
        if (scroll && scroll.setNativeProps) {
            scroll.setNativeProps({ scrollEnabled: !travar });
        }
    });
};
