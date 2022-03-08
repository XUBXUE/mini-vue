1、首先在effect.ts文件中导出一个stop()函数，此函数接受一个参数runner（用于执行副作用函数的函数）
2、在reactiveEffect实例中添加一个stop()函数以供stop() Api函数来调用
3、由于stop()函数需要在所有deps中清除该副作用实例、所以需要在track收集依赖时，将依赖反存到副作用实例中（存在deps属性）
4、调用stop函数循环遍历activeEffect实例中的deps属性并在每个子项中删除该实例。
5、当在effect()函数的第二个参数options中传入onStop函数时，调用stop则会执行onStop的回调。
6、所以在reactiveEffect实例中添加onStop方法属性。并在实例化时进行赋值。
7、当调用stop时如果发现该实例存在onStop方法属性则直接调用。