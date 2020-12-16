/*
Navicat MySQL Data Transfer

Source Server         : mysql
Source Server Version : 80022
Source Host           : localhost:3306
Source Database       : blog

Target Server Type    : MYSQL
Target Server Version : 80022
File Encoding         : 65001

Date: 2020-12-16 18:11:15
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
  `ADDTIME` datetime DEFAULT NULL COMMENT '添加时间',
  `UPDATEACC` varchar(6) DEFAULT NULL COMMENT '修改人的账号',
  `UPDATETIME` datetime DEFAULT NULL COMMENT '修改时间',
  `DELETEACC` varchar(6) DEFAULT NULL COMMENT '删除人的账号',
  `DELETETIME` datetime DEFAULT NULL COMMENT '删除时间',
  `ISDELETE` tinyint NOT NULL DEFAULT '0' COMMENT '数据是否删除，0未删除，1已删除',
  PRIMARY KEY (`categoryId`),
  UNIQUE KEY `categoryType` (`categoryType`),
  KEY `articleCategory_addaccfk` (`ADDACC`),
  KEY `articleCategory_updateaccfk` (`UPDATEACC`),
  KEY `articleCategory_deleteaccfk` (`DELETEACC`),
  CONSTRAINT `articleCategory_addaccfk` FOREIGN KEY (`ADDACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `articleCategory_deleteaccfk` FOREIGN KEY (`DELETEACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `articleCategory_updateaccfk` FOREIGN KEY (`UPDATEACC`) REFERENCES `users` (`userAccount`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of articlecategory
-- ----------------------------

-- ----------------------------
-- Table structure for `articlechildcomment`
-- ----------------------------
DROP TABLE IF EXISTS `articlechildcomment`;
CREATE TABLE `articlechildcomment` (
  `articleId` int NOT NULL COMMENT '文章编号',
  `parentCommnetId` int DEFAULT NULL COMMENT '主评论编号',
  `childCommentId` int NOT NULL COMMENT '子评论编号',
  `replyCommentId` int DEFAULT NULL COMMENT '回复的评论编号',
  PRIMARY KEY (`childCommentId`),
  KEY `articleChildComment_aifk` (`articleId`),
  KEY `articleChildComment_pifk` (`parentCommnetId`),
  KEY `articleChildComment_rifk` (`replyCommentId`),
  CONSTRAINT `articleChildComment_aifk` FOREIGN KEY (`articleId`) REFERENCES `articleinfo` (`articleId`),
  CONSTRAINT `articleChildComment_cifk` FOREIGN KEY (`childCommentId`) REFERENCES `comment` (`commnetId`),
  CONSTRAINT `articleChildComment_pifk` FOREIGN KEY (`parentCommnetId`) REFERENCES `articleparentcomment` (`parentCommnetId`),
  CONSTRAINT `articleChildComment_rifk` FOREIGN KEY (`replyCommentId`) REFERENCES `articlechildcomment` (`childCommentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of articlechildcomment
-- ----------------------------

-- ----------------------------
-- Table structure for `articleinfo`
-- ----------------------------
DROP TABLE IF EXISTS `articleinfo`;
CREATE TABLE `articleinfo` (
  `articleId` int NOT NULL AUTO_INCREMENT,
  `articleTitle` varchar(200) NOT NULL COMMENT '文章标题',
  `articlePara` varchar(150) NOT NULL COMMENT '文章描述，精彩句子',
  `articleImgUrl` varchar(50) DEFAULT NULL COMMENT '文章封面路径',
  `articleContent` text NOT NULL COMMENT '文章内容',
  `ADDACC` varchar(6) DEFAULT NULL COMMENT '添加人的账号',
  `ADDTIME` datetime DEFAULT NULL COMMENT '添加时间',
  `UPDATEACC` varchar(6) DEFAULT NULL COMMENT '修改人的账号',
  `UPDATETIME` datetime DEFAULT NULL COMMENT '修改时间',
  `DELETEACC` varchar(6) DEFAULT NULL COMMENT '删除人的账号',
  `DELETETIME` datetime DEFAULT NULL COMMENT '删除时间',
  `ISDELETE` tinyint NOT NULL DEFAULT '0' COMMENT '数据是否删除，0未删除，1已删除',
  PRIMARY KEY (`articleId`),
  KEY `articleinfo_addaccfk` (`ADDACC`),
  KEY `articleinfo_updateaccfk` (`UPDATEACC`),
  KEY `articleinfo_deleteaccfk` (`DELETEACC`),
  CONSTRAINT `articleinfo_addaccfk` FOREIGN KEY (`ADDACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `articleinfo_deleteaccfk` FOREIGN KEY (`DELETEACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `articleinfo_updateaccfk` FOREIGN KEY (`UPDATEACC`) REFERENCES `users` (`userAccount`)
) ENGINE=InnoDB AUTO_INCREMENT=10000 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of articleinfo
-- ----------------------------

-- ----------------------------
-- Table structure for `articleparentcomment`
-- ----------------------------
DROP TABLE IF EXISTS `articleparentcomment`;
CREATE TABLE `articleparentcomment` (
  `articleId` int NOT NULL COMMENT '文章编号',
  `parentCommnetId` int NOT NULL COMMENT '主评论编号',
  PRIMARY KEY (`parentCommnetId`),
  KEY `articleParentComment_aifk` (`articleId`),
  CONSTRAINT `articleParentComment_aifk` FOREIGN KEY (`articleId`) REFERENCES `articleinfo` (`articleId`),
  CONSTRAINT `articleParentComment_pifk` FOREIGN KEY (`parentCommnetId`) REFERENCES `comment` (`commnetId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of articleparentcomment
-- ----------------------------

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

-- ----------------------------
-- Table structure for `comment`
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `commnetId` int NOT NULL AUTO_INCREMENT COMMENT '评论编号',
  `commentName` varchar(10) NOT NULL COMMENT '评论人名称',
  `commentIcon` varchar(50) DEFAULT NULL COMMENT '评论人头像路径',
  `commentContent` varchar(400) DEFAULT NULL COMMENT '评论内容',
  `commentDate` datetime NOT NULL COMMENT '评论时间',
  `DELETEACC` varchar(6) DEFAULT NULL COMMENT '删除人账号',
  `DELETETIME` datetime DEFAULT NULL COMMENT '删除时间',
  `ISDELETE` tinyint DEFAULT '0' COMMENT '0未删除，1已删除',
  PRIMARY KEY (`commnetId`),
  KEY `comment_dcfk` (`DELETEACC`),
  CONSTRAINT `comment_dcfk` FOREIGN KEY (`DELETEACC`) REFERENCES `users` (`userAccount`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of comment
-- ----------------------------

-- ----------------------------
-- Table structure for `commentcheckstate`
-- ----------------------------
DROP TABLE IF EXISTS `commentcheckstate`;
CREATE TABLE `commentcheckstate` (
  `stateId` int NOT NULL COMMENT '状态编号',
  `commnetId` int NOT NULL COMMENT '评论编号',
  `userAccount` varchar(6) NOT NULL COMMENT '审核人账号',
  `checkDate` datetime NOT NULL COMMENT '审核日期',
  PRIMARY KEY (`commnetId`),
  KEY `commentcheckState_sifk` (`stateId`),
  KEY `commentcheckState_ucfk` (`userAccount`),
  CONSTRAINT `commentcheckState_cifk` FOREIGN KEY (`commnetId`) REFERENCES `comment` (`commnetId`),
  CONSTRAINT `commentcheckState_sifk` FOREIGN KEY (`stateId`) REFERENCES `stateinfo` (`stateId`),
  CONSTRAINT `commentcheckState_ucfk` FOREIGN KEY (`userAccount`) REFERENCES `users` (`userAccount`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of commentcheckstate
-- ----------------------------

-- ----------------------------
-- Table structure for `stateinfo`
-- ----------------------------
DROP TABLE IF EXISTS `stateinfo`;
CREATE TABLE `stateinfo` (
  `stateId` int NOT NULL AUTO_INCREMENT COMMENT '状态编号',
  `stateName` varchar(10) NOT NULL COMMENT '状态名称',
  `stateDes` varchar(100) DEFAULT NULL COMMENT '状态描述',
  `ADDACC` varchar(6) DEFAULT NULL COMMENT '添加人账号',
  `ADDTIME` datetime DEFAULT NULL COMMENT '添加时间',
  `UPDATEACC` varchar(6) DEFAULT NULL COMMENT '修改人账号',
  `UPDATETIME` datetime DEFAULT NULL COMMENT '修改时间',
  `DELETEACC` varchar(6) DEFAULT NULL COMMENT '删除人账号',
  `DELETETIME` datetime DEFAULT NULL COMMENT '删除时间',
  `ISDELETE` tinyint DEFAULT '0' COMMENT '0未删除，1已删除',
  PRIMARY KEY (`stateId`),
  UNIQUE KEY `stateName` (`stateName`),
  KEY `stateinfo_acfk` (`ADDACC`),
  KEY `stateinfo_ucfk` (`UPDATEACC`),
  KEY `stateinfo_dcfk` (`DELETEACC`),
  CONSTRAINT `stateinfo_acfk` FOREIGN KEY (`ADDACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `stateinfo_dcfk` FOREIGN KEY (`DELETEACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `stateinfo_ucfk` FOREIGN KEY (`UPDATEACC`) REFERENCES `users` (`userAccount`)
) ENGINE=InnoDB AUTO_INCREMENT=10000 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of stateinfo
-- ----------------------------

-- ----------------------------
-- Table structure for `userinfo`
-- ----------------------------
DROP TABLE IF EXISTS `userinfo`;
CREATE TABLE `userinfo` (
  `userAccount` varchar(6) NOT NULL COMMENT '用户账号',
  `userName` varchar(50) NOT NULL COMMENT '用户名',
  `userGender` enum('0','1') DEFAULT '0' COMMENT '性别',
  `userImgUrl` varchar(50) DEFAULT NULL COMMENT '用户头像路径',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `weChat` varchar(50) DEFAULT NULL,
  `qqAcc` varchar(11) DEFAULT NULL COMMENT 'qq号',
  `email` varchar(50) DEFAULT NULL COMMENT '邮箱地址',
  `hobby` varchar(500) DEFAULT NULL COMMENT '兴趣爱好',
  `personalDes` varchar(500) DEFAULT NULL COMMENT '个人简介',
  `lifeMotto` varchar(500) DEFAULT NULL COMMENT '人生格言',
  `ADDACC` varchar(6) DEFAULT NULL COMMENT '添加人的账号',
  `ADDTIME` datetime DEFAULT NULL COMMENT '添加时间',
  `UPDATEACC` varchar(6) DEFAULT NULL COMMENT '修改人的账号',
  `UPDATETIME` datetime DEFAULT NULL COMMENT '修改时间',
  `DELETEACC` varchar(6) DEFAULT NULL COMMENT '删除人的账号',
  `DELETETIME` datetime DEFAULT NULL COMMENT '删除时间',
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
INSERT INTO `userinfo` VALUES ('Sadmin', '万松涛', '0', '/upload/woailuo1.jpeg', '1998-05-04', 'SpaceX0529', '2294215581', '2294215581@qq.com', '游山玩水、玩游戏', null, '失败并不可拍，害怕失败才真正可怕', null, null, null, null, null, null, '0');

-- ----------------------------
-- Table structure for `users`
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `userId` smallint NOT NULL AUTO_INCREMENT COMMENT '用户编号',
  `userAccount` varchar(6) NOT NULL COMMENT '用户账号',
  `userPassword` varchar(16) NOT NULL COMMENT '用户的密码',
  `ADDACC` varchar(6) DEFAULT NULL COMMENT '添加人的账号',
  `ADDTIME` datetime DEFAULT NULL COMMENT '添加时间',
  `UPDATEACC` varchar(6) DEFAULT NULL COMMENT '修改人的账号',
  `UPDATETIME` datetime DEFAULT NULL COMMENT '修改时间',
  `DELETEACC` varchar(6) DEFAULT NULL COMMENT '删除人的账号',
  `DELETETIME` datetime DEFAULT NULL COMMENT '删除时间',
  `ISDELETE` tinyint NOT NULL DEFAULT '0' COMMENT '数据是否删除，0未删除，1已删除',
  PRIMARY KEY (`userId`),
  UNIQUE KEY `userAccount` (`userAccount`),
  KEY `users_addaccfk` (`ADDACC`),
  KEY `users_updateaccfk` (`UPDATEACC`),
  KEY `users_deleteaccfk` (`DELETEACC`),
  CONSTRAINT `users_addaccfk` FOREIGN KEY (`ADDACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `users_deleteaccfk` FOREIGN KEY (`DELETEACC`) REFERENCES `users` (`userAccount`),
  CONSTRAINT `users_updateaccfk` FOREIGN KEY (`UPDATEACC`) REFERENCES `users` (`userAccount`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('100', 'Sadmin', 'w1998.0529.love', null, null, null, null, null, null, '0');
