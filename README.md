[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmoeyork%2FEasyRE.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmoeyork%2FEasyRE?ref=badge_shield)

﻿# EasyRE

自用小程序。
使用了[Jison](https://github.com/zaach/jison)和[Viz.js](https://github.com/mdaines/viz.js)

使用的RE语法:
```
RE 		: union | simple-RE ;
union 		: RE "|" simple-RE ;
simple-RE 	: concatenation | basic-RE ;
concatenation 	: simple-RE basic-RE ;
basic-RE 	: star | plus | elementary-RE ;
star 		: elementary-RE "*" ;
plus 		: elementary-RE "+" ;
elementary-RE 	: group | any | char ;
group 		: "(" RE ")" ;
any 		: "." ;
char 		: CHAR ;
```


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmoeyork%2FEasyRE.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmoeyork%2FEasyRE?ref=badge_large)