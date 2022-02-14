1、创建reactive.ts文件 export reactive方法
2、该方法返回proxy实例  其中包括get和set方法
3、get方法返回对应的对象的属性值及收集依赖  track()
4、set方法返回是否设置属性值成功及触发依赖  trigger()
5、实现track()收集依赖函数
  通过传入的对象（target）和对象的属性名（key）两个参数来进行依赖收集
  依赖收集的关系为： 1、首先创建一个总的存放deps的targets容器（Map类型）该容器以target对象为键名，Map类型为值来存放属性名key的一个deps容器
                  2、通过map类型的get方法来以属性名key为键名来获取dep容器，该容器为set类型
                  3、给dep容器add该副作用函数
6、实现trigger()触发依赖函数
  通过传入的对象（target）和对象的属性名（key）两个参数来获取收集到的依赖
  然后通过循环去调用他们（因为是set类型手机的依赖）