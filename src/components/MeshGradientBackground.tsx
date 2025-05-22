import React from 'react';

function MeshGradientBackground({ children }: { children?: React.ReactNode }) {
    return (
        <div style={{ position: 'relative', height: '100%' }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
                backgroundColor: 'hsla(228,84%,4%,1)',
                backgroundImage: `
                    radial-gradient(at 15% 32%, hsla(292,100%,2%,1) 0px, transparent 50%),
                    radial-gradient(at 36% 80%, hsla(326,27%,16%,1) 0px, transparent 50%),
                    radial-gradient(at 100% 100%, hsla(253,60%,79%,1) 0px, transparent 50%),
                    radial-gradient(at 2% 100%, hsla(293,100%,41%,1) 0px, transparent 50%),
                    radial-gradient(at 54% 0%, hsla(19,100%,39%,1) 0px, transparent 50%)`,
                backgroundSize: '150% 150%',
                filter: 'blur(80px)',
                animation: 'moveBackground 10s linear infinite',
            }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </div>
    );
}

export default MeshGradientBackground; 