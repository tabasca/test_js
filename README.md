### Installation

Project requires [Node.js](https://nodejs.org/) v4+ to run.

Install the dependencies and devDependencies and start the server.

```sh
$ cd test_js
$ npm install
$ gulp serve
```
Site would be running on localhost:3501

For production:

```sh
$ cd test_js
$ npm install
$ gulp build
```

### Комментарии

Во время выполнения задания возникли проблемы с mapbox-gl.js (гл стр сайта mapbox.com предлагает использовать именно его. не знала, что есть mapbox.js):
1. для интеграции потребовалась доработка gulpfile (babel), иначе карта не стартовала
2. сильно увеличилось время на пересборку проекта (20сек на сборку скриптов)
3. в итоге, в процессе отрисовки маркеров, карта начала ругаться на широту (видно на [видео третьего задания](йассылконаютуб))
4. переключилась на mapbox.js, с ним проблем не возникло
5. немного модифицировала конфиг еслинта (ругался на "лишние" точки с запятой, на undefined для карты и new для драг-н-дропа)

### Процесс выполнения
пункты по ТЗ - в плейлисте на ютубе, рефакторинги - по ссылкам в списке ниже:

0. initial setup
1. get data
2. render data
3. mapbox initialized
4. dragndrop initialized
5. dragndrop from one list to another
6. added map highlighting
7. added items highlighting

[refactoring](https://drive.google.com/open?id=0ByNFtwyal457c3dqOGR1MFo0RHM) -- transferred some logic to AppModel

[refactoring2](https://drive.google.com/open?id=0ByNFtwyal457OEhwSXRsdWRZaDQ) -- listItemView modified

8. popups

[refactoring3](https://drive.google.com/open?id=0ByNFtwyal457VWNVVkJIa3JMdU0) -- mvp principles

9. a) ascending sort

[refactoring4](https://drive.google.com/open?id=0ByNFtwyal457YXFVX0pSbDFOUTA) -- transferred some data-logic to Model

9. b) descending sort

[refactoring5](https://drive.google.com/open?id=0ByNFtwyal457QTFOM2lQU2xpeFU) -- filters rebuilt, state and dragndrop(through lists) modified

[refactoring6](https://youtu.be/yPMVmYXQ_qE) -- dragndrop(through-across lists) modified

10. filter selected items by features
11. error msg for empty results
12. filter reset
13. invalid marker indicator
14. switched off filters in empty list

15. eslint fixes throughout the project
