var config = {
    filepath : 'assets/' //relative to current directory
};

phantom.injectJs('PhantomLint.js');
PhantomLint.init(config);