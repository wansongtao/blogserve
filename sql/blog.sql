/*
Navicat MySQL Data Transfer

Source Server         : mysql
Source Server Version : 80022
Source Host           : localhost:3306
Source Database       : blog

Target Server Type    : MYSQL
Target Server Version : 80022
File Encoding         : 65001

Date: 2021-04-06 16:35:36
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `articlecategory`
-- ----------------------------
DROP TABLE IF EXISTS `articlecategory`;
CREATE TABLE `articlecategory` (
  `categoryId` int NOT NULL AUTO_INCREMENT,
  `categoryType` varchar(10) NOT NULL COMMENT '文章类目名称',
  `categoryDes` varchar(100) DEFAULT NULL COMMENT '类目描述',
  `ADDACC` varchar(6) DEFAULT NULL COMMENT '添加人的账号',
  `ADDTIME` varchar(50) DEFAULT NULL COMMENT '娣诲姞鏃堕棿',
  `UPDATEACC` varchar(6) DEFAULT NULL COMMENT '修改人的账号',
  `UPDATETIME` varchar(50) DEFAULT NULL COMMENT '淇敼鏃堕棿',
  `DELETEACC` varchar(6) DEFAULT NULL COMMENT '删除人的账号',
  `DELETETIME` varchar(50) DEFAULT NULL COMMENT '鍒犻櫎鏃堕棿',
  `ISDELETE` tinyint NOT NULL DEFAULT '0' COMMENT '数据是否删除，0未删除，1已删除',
  PRIMARY KEY (`categoryId`),
  UNIQUE KEY `categoryType` (`categoryType`),
  KEY `articleCategory_addaccfk` (`ADDACC`),
  KEY `articleCategory_updateaccfk` (`UPDATEACC`),
  KEY `articleCategory_deleteaccfk` (`DELETEACC`),
  CONSTRAINT `articleCategory_addaccfk` FOREIGN KEY (`ADDACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `articleCategory_deleteaccfk` FOREIGN KEY (`DELETEACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `articleCategory_updateaccfk` FOREIGN KEY (`UPDATEACC`) REFERENCES `users` (`userAccount`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of articlecategory
-- ----------------------------
INSERT INTO `articlecategory` VALUES ('100', '文学', null, 'Sadmin', '2021/3/29 15:08:44', 'Sadmin', '2021/3/29 15:08:44', null, null, '0');
INSERT INTO `articlecategory` VALUES ('101', '日记', null, 'Sadmin', '2021/3/29 15:08:44', null, null, 'Sadmin', '2021/3/29 15:39:52', '1');
INSERT INTO `articlecategory` VALUES ('102', 'javascript', null, 'Sadmin', '2021/3/29 15:08:44', null, null, null, null, '0');
INSERT INTO `articlecategory` VALUES ('103', 'node.js', null, 'Sadmin', '2021/3/29 15:08:44', null, null, null, null, '0');
INSERT INTO `articlecategory` VALUES ('104', 'HTML/CSS', null, 'Sadmin', '2021/3/29 15:08:44', null, null, null, null, '0');
INSERT INTO `articlecategory` VALUES ('105', 'vue', null, 'Sadmin', '2021/3/29 15:08:44', null, null, null, null, '0');
INSERT INTO `articlecategory` VALUES ('106', 'Linux', null, 'Sadmin', '2021/3/29 15:27:05', null, null, null, null, '0');
INSERT INTO `articlecategory` VALUES ('107', '笔记', null, 'Sadmin', '2021/3/29 15:40:34', null, null, null, null, '0');

-- ----------------------------
-- Table structure for `articlecomment`
-- ----------------------------
DROP TABLE IF EXISTS `articlecomment`;
CREATE TABLE `articlecomment` (
  `articleId` int NOT NULL,
  `commentId` int NOT NULL,
  PRIMARY KEY (`commentId`),
  KEY `fk_ai` (`articleId`),
  CONSTRAINT `fk_ai` FOREIGN KEY (`articleId`) REFERENCES `articleinfo` (`articleId`),
  CONSTRAINT `fk_ci` FOREIGN KEY (`commentId`) REFERENCES `comment` (`commentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of articlecomment
-- ----------------------------
INSERT INTO `articlecomment` VALUES ('10000', '100');
INSERT INTO `articlecomment` VALUES ('10000', '103');
INSERT INTO `articlecomment` VALUES ('10000', '104');
INSERT INTO `articlecomment` VALUES ('10000', '105');
INSERT INTO `articlecomment` VALUES ('10000', '106');
INSERT INTO `articlecomment` VALUES ('10001', '101');
INSERT INTO `articlecomment` VALUES ('10025', '102');

-- ----------------------------
-- Table structure for `articleinfo`
-- ----------------------------
DROP TABLE IF EXISTS `articleinfo`;
CREATE TABLE `articleinfo` (
  `articleId` int NOT NULL AUTO_INCREMENT,
  `articleTitle` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '鏂囩珷鏍囬',
  `articleContent` text NOT NULL COMMENT '文章内容',
  `articleHot` int DEFAULT '0',
  `ADDACC` varchar(6) DEFAULT NULL COMMENT '添加人的账号',
  `ADDTIME` varchar(50) DEFAULT NULL COMMENT '娣诲姞鏃堕棿',
  `UPDATEACC` varchar(6) DEFAULT NULL COMMENT '修改人的账号',
  `UPDATETIME` varchar(50) DEFAULT NULL COMMENT '淇敼鏃堕棿',
  `DELETEACC` varchar(6) DEFAULT NULL COMMENT '删除人的账号',
  `DELETETIME` varchar(50) DEFAULT NULL COMMENT '鍒犻櫎鏃堕棿',
  `ISDELETE` tinyint NOT NULL DEFAULT '0' COMMENT '数据是否删除，0未删除，1已删除',
  PRIMARY KEY (`articleId`),
  KEY `articleinfo_addaccfk` (`ADDACC`),
  KEY `articleinfo_updateaccfk` (`UPDATEACC`),
  KEY `articleinfo_deleteaccfk` (`DELETEACC`),
  CONSTRAINT `articleinfo_addaccfk` FOREIGN KEY (`ADDACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `articleinfo_deleteaccfk` FOREIGN KEY (`DELETEACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `articleinfo_updateaccfk` FOREIGN KEY (`UPDATEACC`) REFERENCES `users` (`userAccount`)
) ENGINE=InnoDB AUTO_INCREMENT=10026 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of articleinfo
-- ----------------------------
INSERT INTO `articleinfo` VALUES ('10000', 'javaScript中关于数组的各种方法和属性', '<p>1.length属性：获取数组中元素的个数。</p><p><span style=\"background-color: transparent;\"><img src=\"https://pic1.zhimg.com/80/v2-8a445762dc6826969397502191530158_720w.jpg\" width=\"869\"></span></p><p><span style=\"background-color: transparent;\"><img src=\"https://pic2.zhimg.com/80/v2-94c3d90fe1c4b03622db80acb92c0f81_720w.jpg\" width=\"429\"></span></p><p>2.push()方法：给数组添加元素,无须指定索引。</p><p><span style=\"background-color: transparent;\"><img src=\"https://pic1.zhimg.com/80/v2-c1a63a9f2c6cb0fe1f587230b3d8e928_720w.jpg\" width=\"524\"></span></p><p><span style=\"background-color: transparent;\"><img src=\"https://pic2.zhimg.com/80/v2-5139eda330ab0d796128c0758ebf0f61_720w.jpg\" width=\"211\"></span>输出结果</p><p><br></p><p><br></p><p>3.concat()方法：连接两个数组，并返回一个新数组。首先是第一个数组的所有元素，然后是第二个数组的所有元素。</p><p><span style=\"background-color: transparent;\"><img src=\"https://pic4.zhimg.com/80/v2-ce5388db170bf8a2f856d2adbf60a2b7_720w.jpg\" width=\"634\"></span></p><p><span style=\"background-color: transparent;\"><img src=\"https://pic1.zhimg.com/80/v2-69a6a6a3b29cad1d079babd9110a2570_720w.jpg\" width=\"331\"></span>输出结果</p><p><br></p><p><br></p><p>4.slice()方法：复制数组的一部分，不会改变原数组. 有两个参数，第一个参数表示复制的第一个元素的索引,第二个参数表示最后一个复制元素的后一个元素的索引（可选的）。如果没有第二个参数，则复制从第一个参数表示的元素索引的元素到数组结尾。</p><p><span style=\"background-color: transparent;\"><img src=\"https://pic4.zhimg.com/80/v2-0d5d21f1c8b74c19133d3c829433714b_720w.jpg\" width=\"525\"></span></p><p><span style=\"background-color: transparent;\"><img src=\"https://pic3.zhimg.com/80/v2-fa344f3205529e492335c640e7e10d86_720w.jpg\" width=\"206\"></span>输出结果</p><p>5.join()方法：将数组中的所有元素连接起来，并返回一个字符串。允许指定在连接数组元素时插入其间的任意字符。该方法仅有一个参数，即在元素之间插入的字符串。</p><p><span style=\"background-color: transparent;\"><img src=\"https://pic1.zhimg.com/80/v2-d33d6bd21c9f3a12d46504408d62cb34_720w.jpg\" width=\"515\"></span></p><p><span style=\"background-color: transparent;\"><img src=\"https://pic2.zhimg.com/80/v2-1389910baadc24f48142cb5f93f84cc5_720w.png\" width=\"184\"></span>输出结果</p><p>6.sort()方法：对数组进行升序排序，根据Unicode字符编码的十进制大小进行排序。</p><p><span style=\"background-color: transparent;\"><img src=\"https://pic2.zhimg.com/80/v2-6ebc8220b049bdfd26887fb547c6bfd1_720w.jpg\" width=\"521\"></span></p><p><span style=\"background-color: transparent;\"><img src=\"https://pic3.zhimg.com/80/v2-4aaf697392d9bb7d443e7124c85762ba_720w.png\" width=\"119\"></span>输出结果</p><p>7.reverse()方法：反转数组元素的顺序。</p><p><span style=\"background-color: transparent;\"><img src=\"https://pic1.zhimg.com/80/v2-7fb468fb9215041b430d08fc4397c810_720w.jpg\" width=\"529\"></span></p><p><span style=\"background-color: transparent;\"><img src=\"https://pic1.zhimg.com/80/v2-7cba6022c954f8839566c412f1cdfb80_720w.png\" width=\"128\"></span>输出结果</p><p>8.indexOf()方法：返回某元素在数组中的第一个出现位置。如果在数组中没有找到元素，返回-1。</p><p><span style=\"background-color: transparent;\"><img src=\"https://pic1.zhimg.com/80/v2-5fc47221901d1bb3258ee55b5eb80124_720w.jpg\" width=\"1228\"></span></p><p><span style=\"background-color: transparent;\"><img src=\"https://pic1.zhimg.com/80/v2-99f7c4625209d90b16dbf24c1f817024_720w.jpg\" width=\"368\"></span>索引从0开始</p><p>9.lastIndexOf()方法：返回某元素在数组中的最后一个出现位置。如果在数组中没有找到元素，返回-1。</p><p><span style=\"background-color: transparent;\"><img src=\"https://pic3.zhimg.com/80/v2-c4d9741cd9b9330ee0db91a731b4cc6e_720w.jpg\" width=\"1216\"></span></p><p><span style=\"background-color: transparent;\"><img src=\"https://pic3.zhimg.com/80/v2-53b9e723b95d99da6b77c827f07cb8da_720w.jpg\" width=\"373\"></span>索引从0开始</p><p>10.every()方法：测试数组中的所有元素是否通过了函数中的测试。</p><p><span style=\"background-color: transparent;\"><img src=\"https://pic2.zhimg.com/80/v2-791acb86150e18e2670bdfd49563adb5_720w.jpg\" width=\"1112\"></span></p><p><span style=\"background-color: transparent;\"><img src=\"https://pic2.zhimg.com/80/v2-77f42223c044564b82301c0423e81dbd_720w.png\" width=\"408\"></span>未通过</p><p>11.some()方法：测试数组中的某些元素是否通过了函数中的测试。</p><p><span style=\"background-color: transparent;\"><img src=\"https://pic2.zhimg.com/80/v2-25d191f158e9f961fe52c1d51c1b79b1_720w.jpg\" width=\"1099\"></span></p><p><span style=\"background-color: transparent;\"><img src=\"https://pic2.zhimg.com/80/v2-6892fe92a0c45cdf3f17f1ee88621c9d_720w.png\" width=\"392\"></span>通过</p><p>12.filter()方法：对数组中的每个元素执行某函数，如果该函数对某个元素返回true，就把该元素添加到filter()方法返回的另一个数组中。</p><p><span style=\"background-color: transparent;\"><img src=\"https://pic3.zhimg.com/80/v2-6076597b330fc02d4e104c170218ffc6_720w.jpg\" width=\"828\"></span></p><p><span style=\"background-color: transparent;\"><img src=\"https://pic1.zhimg.com/80/v2-a227eb96fd132ae2acc93b7769ac4b10_720w.jpg\" width=\"278\"></span></p><p>13.forEach()方法：对数组中的每个元素都执行操作，没有返回值。</p><p><span style=\"background-color: transparent;\"><img src=\"https://pic2.zhimg.com/80/v2-b728036ffc7c52301a6ddcfee0861f19_720w.jpg\" width=\"667\"></span></p><p>14.map()方法：对数组中的每个元素都执行一个给定函数，但也返回一个包含函数执行结果的新数组。</p><p><span style=\"background-color: transparent;\"><img src=\"https://pic3.zhimg.com/80/v2-0ed701e7777688f6de179c17ea887026_720w.jpg\" width=\"728\"></span></p><p><span style=\"background-color: transparent;\"><img src=\"https://pic3.zhimg.com/80/v2-740b1dc711d3f77349ed50f95fe4c392_720w.png\" width=\"139\"></span></p><p><br></p>', '10', 'Sadmin', '2020-12-30 02:35:09', null, null, null, null, '0');
INSERT INTO `articleinfo` VALUES ('10001', 'JavaScript中Date对象的各种格式', '<p>&nbsp;&nbsp;&nbsp;&nbsp;let&nbsp;localTime&nbsp;=&nbsp;new&nbsp;Date();</p><p>&nbsp;&nbsp;&nbsp;&nbsp;Date对象只保存了自UTC时间1970年1月1日午夜到客户端计算机时钟的日期时间的毫秒数</p><p><br></p><p>&nbsp;&nbsp;&nbsp;&nbsp;toUTCString()方法将localTime中的日期和时间转换为对应的UTC日期和时间。Thu,&nbsp;06&nbsp;Aug&nbsp;2020&nbsp;02:34:21&nbsp;GMT</p><p><br></p><p>&nbsp;&nbsp;&nbsp;&nbsp;toLocaleString()方法返回本地日期和时间值&nbsp;&nbsp;2020/8/6&nbsp;上午10:34:21</p><p><br></p><p>&nbsp;&nbsp;&nbsp;&nbsp;getTimezoneOffset()方法返回本地时间与UTC时间之间的差值（以分钟为单位）&nbsp;&nbsp;-480</p><p><br></p><p>&nbsp;&nbsp;&nbsp;&nbsp;toLocaleTimeString()显示用户在其计算机上指定的时间&nbsp;&nbsp;上午10:34:21</p><p><br></p><p>&nbsp;&nbsp;&nbsp;&nbsp;toTimeString()显示时间部分和对应的时区&nbsp;&nbsp;10:34:21&nbsp;GMT+0800&nbsp;(中国标准时间)</p><p><br></p><p>&nbsp;&nbsp;&nbsp;&nbsp;toLocaleDateString()方法按用户在其计算机上设定的格式显示日期。2020/8/6</p><p><br></p><p>&nbsp;&nbsp;&nbsp;toDateString()方法使用标准格式显示用户计算机上的当前日期。Thu&nbsp;Aug&nbsp;06&nbsp;2020</p><p><br></p><p>&nbsp;&nbsp;&nbsp;&nbsp;toISOString()方法，以ISO格式字符串的形式返回日期和时间，格式：YYYY-MM-DDTHH:mm:ss.sssZ&nbsp;&nbsp;&nbsp;T将日期和时间分隔开&nbsp;末尾的Z表示UTC时区</p>', '3', 'Sadmin', '2020-12-30 08:39:11', null, null, null, null, '0');
INSERT INTO `articleinfo` VALUES ('10025', '测试', '<p>踩踩踩踩踩踩</p>', '0', 'Sadmin', '2021/3/29 11:58:09', null, null, null, null, '0');

-- ----------------------------
-- Table structure for `articlestate`
-- ----------------------------
DROP TABLE IF EXISTS `articlestate`;
CREATE TABLE `articlestate` (
  `articleId` int NOT NULL,
  `stateNum` tinyint NOT NULL,
  PRIMARY KEY (`articleId`,`stateNum`),
  KEY `fk_sn` (`stateNum`),
  CONSTRAINT `fk_art` FOREIGN KEY (`articleId`) REFERENCES `articleinfo` (`articleId`),
  CONSTRAINT `fk_sn` FOREIGN KEY (`stateNum`) REFERENCES `checkstate` (`stateNum`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of articlestate
-- ----------------------------
INSERT INTO `articlestate` VALUES ('10000', '2');
INSERT INTO `articlestate` VALUES ('10025', '2');
INSERT INTO `articlestate` VALUES ('10001', '3');

-- ----------------------------
-- Table structure for `articletype`
-- ----------------------------
DROP TABLE IF EXISTS `articletype`;
CREATE TABLE `articletype` (
  `articleId` int NOT NULL,
  `categoryId` int NOT NULL,
  PRIMARY KEY (`articleId`,`categoryId`),
  KEY `articleType_cifk` (`categoryId`),
  CONSTRAINT `articleType_aifk` FOREIGN KEY (`articleId`) REFERENCES `articleinfo` (`articleId`),
  CONSTRAINT `articleType_cifk` FOREIGN KEY (`categoryId`) REFERENCES `articlecategory` (`categoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of articletype
-- ----------------------------
INSERT INTO `articletype` VALUES ('10025', '101');
INSERT INTO `articletype` VALUES ('10000', '102');
INSERT INTO `articletype` VALUES ('10001', '102');

-- ----------------------------
-- Table structure for `checkstate`
-- ----------------------------
DROP TABLE IF EXISTS `checkstate`;
CREATE TABLE `checkstate` (
  `stateId` int NOT NULL AUTO_INCREMENT,
  `stateNum` tinyint NOT NULL,
  `stateDes` varchar(50) NOT NULL,
  PRIMARY KEY (`stateId`),
  UNIQUE KEY `stateNum` (`stateNum`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of checkstate
-- ----------------------------
INSERT INTO `checkstate` VALUES ('100', '1', '待审核');
INSERT INTO `checkstate` VALUES ('101', '2', '仅后台用户可见');
INSERT INTO `checkstate` VALUES ('102', '3', '所有用户可见');
INSERT INTO `checkstate` VALUES ('103', '4', '仅管理员可见');

-- ----------------------------
-- Table structure for `childrencomment`
-- ----------------------------
DROP TABLE IF EXISTS `childrencomment`;
CREATE TABLE `childrencomment` (
  `parentId` int NOT NULL,
  `childId` int NOT NULL,
  `replyId` int DEFAULT NULL,
  PRIMARY KEY (`childId`),
  KEY `fk_ccpi` (`parentId`),
  KEY `fk_ccri` (`replyId`),
  CONSTRAINT `fk_ccci` FOREIGN KEY (`childId`) REFERENCES `comment` (`commentId`),
  CONSTRAINT `fk_ccpi` FOREIGN KEY (`parentId`) REFERENCES `comment` (`commentId`),
  CONSTRAINT `fk_ccri` FOREIGN KEY (`replyId`) REFERENCES `comment` (`commentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of childrencomment
-- ----------------------------
INSERT INTO `childrencomment` VALUES ('100', '103', null);
INSERT INTO `childrencomment` VALUES ('100', '104', '103');
INSERT INTO `childrencomment` VALUES ('108', '109', null);
INSERT INTO `childrencomment` VALUES ('108', '110', '109');

-- ----------------------------
-- Table structure for `comment`
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `commentId` int NOT NULL AUTO_INCREMENT,
  `commentContent` varchar(200) NOT NULL,
  `commentTime` varchar(50) NOT NULL,
  `ISDELETE` tinyint DEFAULT '0',
  `DELETETIME` varchar(50) DEFAULT NULL,
  `DELETEACC` varchar(6) DEFAULT NULL,
  PRIMARY KEY (`commentId`),
  KEY `fk_delacc` (`DELETEACC`),
  CONSTRAINT `fk_delacc` FOREIGN KEY (`DELETEACC`) REFERENCES `users` (`userAccount`)
) ENGINE=InnoDB AUTO_INCREMENT=118 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of comment
-- ----------------------------
INSERT INTO `comment` VALUES ('100', '哈哈哈哈哈', '2021/3/29 15:08:44', '0', null, null);
INSERT INTO `comment` VALUES ('101', '测试测试', '2021/3/29 15:08:44', '0', null, null);
INSERT INTO `comment` VALUES ('102', '参数', '2021/3/29 15:10:44', '1', '2021/3/29 18:25:20', 'Sadmin');
INSERT INTO `comment` VALUES ('103', '子评论', '2021/3/29 15:08:44', '0', null, null);
INSERT INTO `comment` VALUES ('104', '回复子评论', '2021/3/29 15:08:44', '0', null, null);
INSERT INTO `comment` VALUES ('105', '踩踩踩踩踩踩踩踩踩', '2021/3/29 15:08:44', '0', null, null);
INSERT INTO `comment` VALUES ('106', '哈哈哈哈的事实', '2021/3/29 15:08:44', '0', null, null);
INSERT INTO `comment` VALUES ('107', '触发器测试', '2021/3/29 15:10:22', '0', null, null);
INSERT INTO `comment` VALUES ('108', '评论测试', '2021/4/6 11:40:18', '0', null, null);
INSERT INTO `comment` VALUES ('109', '子评论测试', '2021/4/6 11:42:04', '0', null, null);
INSERT INTO `comment` VALUES ('110', '回复子评论测试', '2021/4/6 11:43:03', '0', null, null);
INSERT INTO `comment` VALUES ('111', '回复子评论测试', '2021/4/6 14:18:15', '0', null, null);

-- ----------------------------
-- Table structure for `commentcheckstate`
-- ----------------------------
DROP TABLE IF EXISTS `commentcheckstate`;
CREATE TABLE `commentcheckstate` (
  `stateId` int NOT NULL,
  `commentId` int NOT NULL,
  `checkAcc` varchar(6) DEFAULT NULL,
  `checkTime` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`commentId`),
  KEY `fk_ccssi` (`stateId`),
  KEY `fk_ccsacc` (`checkAcc`),
  CONSTRAINT `fk_ccsacc` FOREIGN KEY (`checkAcc`) REFERENCES `users` (`userAccount`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ccsci` FOREIGN KEY (`commentId`) REFERENCES `comment` (`commentId`),
  CONSTRAINT `fk_ccssi` FOREIGN KEY (`stateId`) REFERENCES `commentstate` (`stateId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of commentcheckstate
-- ----------------------------
INSERT INTO `commentcheckstate` VALUES ('3', '100', 'Sadmin', '2021/3/29 18:25:13');
INSERT INTO `commentcheckstate` VALUES ('2', '101', 'Sadmin', '2021/3/29 18:24:22');
INSERT INTO `commentcheckstate` VALUES ('1', '102', null, null);
INSERT INTO `commentcheckstate` VALUES ('3', '103', 'aibin', '2021/3/29 18:30:29');
INSERT INTO `commentcheckstate` VALUES ('3', '104', 'Sadmin', '2021/3/29 21:58:52');
INSERT INTO `commentcheckstate` VALUES ('2', '105', 'Sadmin', '2021/3/29 21:58:51');
INSERT INTO `commentcheckstate` VALUES ('2', '106', 'Sadmin', '2021/3/29 21:58:50');
INSERT INTO `commentcheckstate` VALUES ('1', '107', null, null);
INSERT INTO `commentcheckstate` VALUES ('1', '108', null, null);
INSERT INTO `commentcheckstate` VALUES ('1', '109', null, null);
INSERT INTO `commentcheckstate` VALUES ('1', '110', null, null);
INSERT INTO `commentcheckstate` VALUES ('1', '111', null, null);

-- ----------------------------
-- Table structure for `commentstate`
-- ----------------------------
DROP TABLE IF EXISTS `commentstate`;
CREATE TABLE `commentstate` (
  `stateId` int NOT NULL AUTO_INCREMENT,
  `stateDes` varchar(50) NOT NULL,
  PRIMARY KEY (`stateId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of commentstate
-- ----------------------------
INSERT INTO `commentstate` VALUES ('1', '待审核');
INSERT INTO `commentstate` VALUES ('2', '审核通过');
INSERT INTO `commentstate` VALUES ('3', '审核不通过');

-- ----------------------------
-- Table structure for `message`
-- ----------------------------
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
  `msgId` int NOT NULL AUTO_INCREMENT,
  `msgContent` varchar(200) NOT NULL,
  `addTime` varchar(50) NOT NULL,
  `isDelete` tinyint DEFAULT '0',
  `deleteTime` varchar(50) DEFAULT NULL,
  `deleteAcc` varchar(6) DEFAULT NULL,
  PRIMARY KEY (`msgId`),
  KEY `msg_dele` (`deleteAcc`),
  CONSTRAINT `msg_dele` FOREIGN KEY (`deleteAcc`) REFERENCES `users` (`userAccount`)
) ENGINE=InnoDB AUTO_INCREMENT=1003 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of message
-- ----------------------------
INSERT INTO `message` VALUES ('1000', '测试', '2021/3/29 15:08:44', '1', '2021/4/6 15:55:52', 'Sadmin');
INSERT INTO `message` VALUES ('1001', '测试1', '2021/3/29 15:08:44', '0', null, null);
INSERT INTO `message` VALUES ('1002', '留言接口测试', '2021/4/6 14:31:58', '0', null, null);

-- ----------------------------
-- Table structure for `messagecheck`
-- ----------------------------
DROP TABLE IF EXISTS `messagecheck`;
CREATE TABLE `messagecheck` (
  `stateId` int NOT NULL,
  `msgId` int NOT NULL,
  `checkAcc` varchar(6) DEFAULT NULL,
  `checkTime` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`stateId`,`msgId`),
  KEY `msg_msgId` (`msgId`),
  KEY `msg_acc` (`checkAcc`),
  CONSTRAINT `msg_acc` FOREIGN KEY (`checkAcc`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `msg_msgId` FOREIGN KEY (`msgId`) REFERENCES `message` (`msgId`),
  CONSTRAINT `msg_stateId` FOREIGN KEY (`stateId`) REFERENCES `commentstate` (`stateId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of messagecheck
-- ----------------------------
INSERT INTO `messagecheck` VALUES ('1', '1000', 'Sadmin', '2021/3/29 15:08:44');
INSERT INTO `messagecheck` VALUES ('2', '1002', 'aibin', '2021/4/6 16:13:51');
INSERT INTO `messagecheck` VALUES ('3', '1001', 'aibin', '2021/4/6 16:13:52');

-- ----------------------------
-- Table structure for `power`
-- ----------------------------
DROP TABLE IF EXISTS `power`;
CREATE TABLE `power` (
  `powerId` int NOT NULL AUTO_INCREMENT,
  `powerName` varchar(50) NOT NULL,
  `ISDELETE` tinyint DEFAULT '0',
  `deleteAcc` varchar(6) DEFAULT NULL,
  `deletetime` varchar(50) DEFAULT NULL,
  `addAcc` varchar(6) DEFAULT NULL,
  `addTime` varchar(50) DEFAULT NULL,
  `updateAcc` varchar(6) DEFAULT NULL,
  `updateTime` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`powerId`),
  UNIQUE KEY `powerName` (`powerName`),
  KEY `fk_deleteacc` (`deleteAcc`),
  KEY `fk_addacc` (`addAcc`),
  KEY `fk_updateacc` (`updateAcc`),
  CONSTRAINT `fk_addacc` FOREIGN KEY (`addAcc`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `fk_deleteacc` FOREIGN KEY (`deleteAcc`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `fk_updateacc` FOREIGN KEY (`updateAcc`) REFERENCES `users` (`userAccount`)
) ENGINE=InnoDB AUTO_INCREMENT=10004 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of power
-- ----------------------------
INSERT INTO `power` VALUES ('10001', '超级管理员', '0', null, null, null, null, null, null);
INSERT INTO `power` VALUES ('10002', '管理员', '0', null, null, null, null, null, null);
INSERT INTO `power` VALUES ('10003', '普通用户', '0', null, null, null, null, null, null);

-- ----------------------------
-- Table structure for `userinfo`
-- ----------------------------
DROP TABLE IF EXISTS `userinfo`;
CREATE TABLE `userinfo` (
  `userAccount` varchar(6) NOT NULL COMMENT '用户账号',
  `userName` varchar(50) NOT NULL COMMENT '用户名',
  `userGender` enum('0','1') DEFAULT '0' COMMENT '性别',
  `userImgUrl` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '鐢ㄦ埛澶村儚璺緞',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `weChat` varchar(50) DEFAULT NULL,
  `qqAcc` varchar(11) DEFAULT NULL COMMENT 'qq号',
  `email` varchar(50) DEFAULT NULL COMMENT '邮箱地址',
  `hobby` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '鍏磋叮鐖卞ソ',
  `personalDes` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '涓汉绠€浠?',
  `lifeMotto` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '浜虹敓鏍艰█',
  `ADDACC` varchar(6) DEFAULT NULL COMMENT '添加人的账号',
  `ADDTIME` varchar(50) DEFAULT NULL COMMENT '娣诲姞鏃堕棿',
  `UPDATEACC` varchar(6) DEFAULT NULL COMMENT '修改人的账号',
  `UPDATETIME` varchar(50) DEFAULT NULL COMMENT '淇敼鏃堕棿',
  `DELETEACC` varchar(6) DEFAULT NULL COMMENT '删除人的账号',
  `DELETETIME` varchar(50) DEFAULT NULL COMMENT '鍒犻櫎鏃堕棿',
  `ISDELETE` tinyint NOT NULL DEFAULT '0' COMMENT '数据是否删除，0未删除，1已删除',
  PRIMARY KEY (`userAccount`),
  UNIQUE KEY `userName` (`userName`),
  KEY `userinfo_addaccfk` (`ADDACC`),
  KEY `userinfo_updateaccfk` (`UPDATEACC`),
  KEY `userinfo_deleteaccfk` (`DELETEACC`),
  CONSTRAINT `userinfo_addaccfk` FOREIGN KEY (`ADDACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `userinfo_deleteaccfk` FOREIGN KEY (`DELETEACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `userinfo_updateaccfk` FOREIGN KEY (`UPDATEACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `uuserinfo_userAccfk` FOREIGN KEY (`userAccount`) REFERENCES `users` (`userAccount`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of userinfo
-- ----------------------------
INSERT INTO `userinfo` VALUES ('aibin', '艾宾如', '1', '/upload/upload_97c277f6ba59a56163b92e6fd6b8806c.jpeg', '1999-11-11', 'dream', '34131324123', '无', '看书', '空', '空', null, null, null, null, null, null, '0');
INSERT INTO `userinfo` VALUES ('sadmin', '万松涛', '1', '/upload/upload_97c277f6ba59a56163b92e6fd6b8806c.jpeg', '1998-05-04', 'SpaceX0529', '2294215581', '2294215581@qq.com', '游戏/编程', '一个实事求是、就事论事的直男。', '千山鸟飞绝，万径人踪灭。', null, null, null, null, null, null, '0');
INSERT INTO `userinfo` VALUES ('yujuan', '吴玉娟', '0', null, null, null, null, null, null, null, null, null, null, null, null, null, null, '0');

-- ----------------------------
-- Table structure for `userpower`
-- ----------------------------
DROP TABLE IF EXISTS `userpower`;
CREATE TABLE `userpower` (
  `userAccount` varchar(6) NOT NULL,
  `powerId` int NOT NULL,
  PRIMARY KEY (`userAccount`,`powerId`),
  KEY `fk_pi` (`powerId`),
  CONSTRAINT `fk_pi` FOREIGN KEY (`powerId`) REFERENCES `power` (`powerId`),
  CONSTRAINT `fk_ua` FOREIGN KEY (`userAccount`) REFERENCES `users` (`userAccount`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of userpower
-- ----------------------------
INSERT INTO `userpower` VALUES ('sadmin', '10001');
INSERT INTO `userpower` VALUES ('aibin', '10002');
INSERT INTO `userpower` VALUES ('yujuan', '10003');

-- ----------------------------
-- Table structure for `users`
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `userId` smallint NOT NULL AUTO_INCREMENT COMMENT '用户编号',
  `userAccount` varchar(6) NOT NULL COMMENT '用户账号',
  `userPassword` varchar(16) NOT NULL COMMENT '用户的密码',
  `ADDACC` varchar(6) DEFAULT NULL COMMENT '添加人的账号',
  `ADDTIME` varchar(50) DEFAULT NULL COMMENT '娣诲姞鏃堕棿',
  `UPDATEACC` varchar(6) DEFAULT NULL COMMENT '修改人的账号',
  `UPDATETIME` varchar(50) DEFAULT NULL COMMENT '淇敼鏃堕棿',
  `DELETEACC` varchar(6) DEFAULT NULL COMMENT '删除人的账号',
  `DELETETIME` varchar(50) DEFAULT NULL COMMENT '鍒犻櫎鏃堕棿',
  `ISDELETE` tinyint NOT NULL DEFAULT '0' COMMENT '数据是否删除，0未删除，1已删除',
  PRIMARY KEY (`userId`),
  UNIQUE KEY `userAccount` (`userAccount`),
  KEY `users_addaccfk` (`ADDACC`),
  KEY `users_updateaccfk` (`UPDATEACC`),
  KEY `users_deleteaccfk` (`DELETEACC`),
  CONSTRAINT `users_addaccfk` FOREIGN KEY (`ADDACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `users_deleteaccfk` FOREIGN KEY (`DELETEACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `users_updateaccfk` FOREIGN KEY (`UPDATEACC`) REFERENCES `users` (`userAccount`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('100', 'Sadmin', 'w1Sadmin123', null, null, 'Sadmin', '2021/3/27 14:17:34', null, null, '0');
INSERT INTO `users` VALUES ('101', 'aibin', 'w1aibin123', null, null, 'Sadmin', '2021/3/26 22:08:15', 'Sadmin', '', '0');
INSERT INTO `users` VALUES ('102', 'yujuan', 'w1yujuan123', 'Sadmin', '2021/3/27 11:07:52', null, null, null, null, '0');

-- ----------------------------
-- View structure for `articlelist`
-- ----------------------------
DROP VIEW IF EXISTS `articlelist`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `articlelist` AS select `ai`.`articleId` AS `articleId`,`ai`.`articleTitle` AS `articleTitle`,`ai`.`articleContent` AS `articleContent`,`ai`.`articleHot` AS `hot`,`u`.`userName` AS `author`,`ai`.`ADDACC` AS `ADDACC`,`ai`.`ADDTIME` AS `addtime`,`ac`.`categoryType` AS `categoryType`,`cs`.`stateDes` AS `stateDes`,`cs`.`stateNum` AS `stateNum`,`ai`.`ISDELETE` AS `isdelete` from (((((`articleinfo` `ai` join `articletype` `ap` on((`ai`.`articleId` = `ap`.`articleId`))) join `articlecategory` `ac` on((`ap`.`categoryId` = `ac`.`categoryId`))) join `articlestate` `ars` on((`ai`.`articleId` = `ars`.`articleId`))) join `checkstate` `cs` on((`ars`.`stateNum` = `cs`.`stateNum`))) join `userinfo` `u` on((`ai`.`ADDACC` = `u`.`userAccount`))) ;

-- ----------------------------
-- View structure for `commentlist`
-- ----------------------------
DROP VIEW IF EXISTS `commentlist`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `commentlist` AS select `c`.`commentId` AS `commentId`,`c`.`commentContent` AS `commentContent`,`c`.`commentTime` AS `commentTime`,`ai`.`articleTitle` AS `articleTitle`,`ai`.`articleId` AS `articleId`,`ct`.`stateDes` AS `stateDes`,`c`.`ISDELETE` AS `isDelete`,`u`.`userName` AS `auditor`,`ccm`.`parentId` AS `parentId`,`ccm`.`replyId` AS `replyId` from ((((((`comment` `c` join `articlecomment` `ac` on((`c`.`commentId` = `ac`.`commentId`))) join `articleinfo` `ai` on((`ac`.`articleId` = `ai`.`articleId`))) join `commentcheckstate` `ccs` on((`c`.`commentId` = `ccs`.`commentId`))) join `commentstate` `ct` on((`ccs`.`stateId` = `ct`.`stateId`))) left join `userinfo` `u` on((`u`.`userAccount` = `ccs`.`checkAcc`))) left join `childrencomment` `ccm` on((`ccm`.`childId` = `c`.`commentId`))) ;

-- ----------------------------
-- View structure for `messagelist`
-- ----------------------------
DROP VIEW IF EXISTS `messagelist`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `messagelist` AS select `m`.`msgId` AS `msgId`,`m`.`msgContent` AS `msgContent`,`m`.`addTime` AS `addTime`,`m`.`isDelete` AS `isDelete`,`c`.`checkAcc` AS `checkAcc`,`c`.`checkTime` AS `checkTime`,`s`.`stateDes` AS `stateDes` from ((`message` `m` join `messagecheck` `c` on((`m`.`msgId` = `c`.`msgId`))) join `commentstate` `s` on((`c`.`stateId` = `s`.`stateId`))) ;

-- ----------------------------
-- View structure for `userlist`
-- ----------------------------
DROP VIEW IF EXISTS `userlist`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `userlist` AS select `u`.`userAccount` AS `userAccount`,`i`.`userName` AS `userName`,`i`.`userGender` AS `userGender`,`w`.`powerName` AS `powerName`,`u`.`ISDELETE` AS `ISDELETE`,`u`.`userId` AS `userId` from (((`users` `u` join `userinfo` `i` on((`u`.`userAccount` = `i`.`userAccount`))) join `userpower` `p` on((`u`.`userAccount` = `p`.`userAccount`))) join `power` `w` on((`p`.`powerId` = `w`.`powerId`))) ;
DROP TRIGGER IF EXISTS `addcommentstate`;
DELIMITER ;;
CREATE TRIGGER `addcommentstate` AFTER INSERT ON `comment` FOR EACH ROW begin
INSERT INTO commentcheckstate (stateId, commentId) VALUES(1, new.commentId);
end
;;
DELIMITER ;
DROP TRIGGER IF EXISTS `insertmsg`;
DELIMITER ;;
CREATE TRIGGER `insertmsg` AFTER INSERT ON `message` FOR EACH ROW INSERT INTO messagecheck (stateId, msgId) VALUES(1, new.msgId)
;;
DELIMITER ;
