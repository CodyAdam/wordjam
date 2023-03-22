import React from 'react';

export const useWindowSize = (pixelRatio = 1) => {
	const ratio = Math.round(pixelRatio) || 1;
	const [size, setSize] = React.useState([window.innerWidth * ratio, window.innerHeight * ratio]);
	React.useLayoutEffect(() => {
		const updateSize = () => setSize([window.innerWidth * ratio, window.innerHeight * ratio]);
		window.addEventListener('resize', updateSize);
		updateSize();
		return () => window.removeEventListener('resize', updateSize);
	}, [ratio]);
	return size;
};

export default useWindowSize;
