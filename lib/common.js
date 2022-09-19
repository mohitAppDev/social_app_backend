var db = require('../config/sequelize').db;
var generalConfig = require('../config/generalConfig');
var fs = require('fs-extra');
var path = require('path');
const multer = require('multer')
const Cryptr = require('cryptr'); 
const cryptr = new Cryptr(generalConfig.saltKey);
/*
* Check if user email exist
*/

var checkUserEmailExistStatus = function checkUserEmailExistStatus(emailAddress, callback) {
  db.models.user
    .findOne({
      where: {
        email: emailAddress
      }
    })
    .then(function (user) {

      var isEmailUnique = ((user) ? true : false);
      callback({
        status: "success",
        data: isEmailUnique,
        message: 'User email status request has been completed successfully'
      });
    })
    .catch(function (err) {
      callback({
        status: "success",
        data: null,
        message: 'User email status request has not been completed successfully'
      });
    });
}

/**
 * load profile images urls into user object
 * @param  [object] user
 */
var loadProfileImages = function (user, callback) {

  if (user) {
    //  set profile picture original image url
    user.setDataValue('profileimage', generalConfig.serverUrl + '/uploads/admin_profile/noimage.png');
    if (user.profile_image) {
      var imagePath = generalConfig.filesPath.userPicture + user.profile_image;
      try {
        fs.accessSync(imagePath);
        var imageurl = generalConfig.serverUrl + '/' + imagePath;
        user.setDataValue('profileimage', imageurl);
      } catch (e) {
        console.log(e);
      }
    }
    callback();

  }

};

/**
 * get  profile image urls into user raw data ( For Admin )
 * @param  [raw] user
 */
var getProfileImage = function (user, callback) {

  if (user) {
    //  set profile picture original image url

    if (user.profile_image) {

      try {
        // fs.accessSync(imagePath);
        var imageurl = generalConfig.serverUrl + '/' + generalConfig.filesPath.userPicture + user.profile_image;
        var thumburl = generalConfig.serverUrl + '/' + generalConfig.filesPath.userPicture + user.profile_image;

        user.setDataValue('profileimage', imageurl);
        user.setDataValue('profileimagethumb', thumburl);
      } catch (e) {
        console.log(e);
      }
    }
    else {
      var imageurl = generalConfig.serverUrl + '/uploads/admin_profile/thumb768_noimage.png';
      var thumburl = generalConfig.serverUrl + '/uploads/admin_profile/thumb100_noimage.png';

      user.setDataValue('profileimage', imageurl);
      user.setDataValue('profileimagethumb', thumburl);
    }
    callback();

  }

};



/**
 * store profile picture
 * @param  file file
 * @param  [func] callback 
 * @return json
 */
var storeProfilePicture = function storeProfilePicture(profilePictureFile, userid, callback) {

  var file = profilePictureFile;
  var filename = userid + "-" + Date.now() + path.extname(file.name);

  var result = { 'status': true }

  var validextensions = generalConfig.validImageExtensions;
  var fileextension = path.extname(file.name).toLowerCase();

  if (file.size > generalConfig.validImageSize) {
    result.status = false;
    result.message = "File too large , max file size allowed 2MB";
    callback(result);
  }

  else if (validextensions.indexOf(fileextension) == -1) {
    result.status = false;
    result.message = "Invalid Image File";
    callback(result);
  }
  else {
    var tempPath = file.path;
    var targetPath = path.resolve(generalConfig.filesPath.userPicture + filename);

    fs.copy(tempPath, targetPath, function (err) {
      if (err) {
        result.status = false;
        result.message = err;
        callback(result);
      } else {
        result.filename = filename;
        callback(result);
      }

    });
  }

};

/**
 * remove profile picture
 * @param  file file
 * @param  [func] callback 
 * @return json
 */
var removeProfilePicture = function (profileimagefile) {
  if (profileimagefile != undefined && profileimagefile != "") {
    var imagePath = path.resolve(generalConfig.filesPath.userPicture + profileimagefile);
    fs.stat(imagePath, function (err, stat) {
      if (err == null) {
        fs.unlink(imagePath, function (err) {
          if (err) throw err;
        });
      }
    });
    //Delete thumb 100
    var thumb100Path = path.resolve(generalConfig.filesPath.userPicture + 'thumb100_' + profileimagefile);
    fs.stat(thumb100Path, function (err, stat) {
      if (err == null) {
        fs.unlink(thumb100Path, function (err) {
          if (err) throw err;
        });
      }
    });
    //Delete thumb 768
    var thumb768Path = path.resolve(generalConfig.filesPath.userPicture + 'thumb768_' + profileimagefile);
    fs.stat(thumb768Path, function (err, stat) {
      if (err == null) {
        fs.unlink(thumb768Path, function (err) {
          if (err) throw err;
        });
      }
    });
  }
};


/**
 * All responce will go throuth output function 
 * @param  response , json output data
 * @param  [func] return
 * @return json
 */
var output = function (res, data) {
  if (res.req.user !== undefined) {
    if (res.req.user.token_expired == true) {
      data['newToken'] = res.req.user.newToken;
    }
  }

  res.json(data);
}

// Remove Employee Information Images 
var removeEmpInfoImages = function (images) { 
  if (images) {
    var { employment_proof, sal_slip_first, sal_slip_second, sal_slip_third } = images; 
    if(images.employment_proof){
      employment_proof.map(element =>
        removeImages(element)
      )
    }
    if(images.sal_slip_first){
      sal_slip_first.map(element =>
        removeImages(element)
      ) 
    }
    if(images.sal_slip_second){
      sal_slip_second.map(element =>
        removeImages(element)
      ) 
    }
    if(images.sal_slip_third){
      sal_slip_third.map(element =>
        removeImages(element)
      ) 
    } 
  }
} 

function removeImages(employmentProfDetails) {
  if (employmentProfDetails != undefined && employmentProfDetails != "") {
    var imagePath = path.resolve(generalConfig.filesPath.userProfileDoc + employmentProfDetails); 
    fs.stat(imagePath, function (err, stat) {
      if (err == null) {
        fs.unlink(imagePath, function (err) {
          if (err) throw err;
          console.log('file deleted successfully');
        });
      }else if(err.code === 'ENOENT') {
        // file does not exist
          console.log("file does not exist");
        } else {
          console.log('Some other error: ', err.code);
        }
    });
  }
}

// Get Employement Proof Images...

var getEmpProofImage = function (empInfo, callback) {
  if (empInfo) {
    //  Set Employement Proof Images url 
    if (empInfo) { 
      try {
        // fs.accessSync(imagePath);  
        
        const {employment_proof, sal_slip_first,sal_slip_second,sal_slip_third } = empInfo
        var employmentProof = employment_proof.map(element =>
          generalConfig.serverUrl + '/' + generalConfig.filesPath.userProfileDoc + element
        )
        var salarySlipFirst = sal_slip_first.map(element =>
          generalConfig.serverUrl + '/' + generalConfig.filesPath.userProfileDoc + element
        ) 
        var salarySlipSecond = sal_slip_second.map(element =>
          generalConfig.serverUrl + '/' + generalConfig.filesPath.userProfileDoc + element
        )
        var salarySlipThird = sal_slip_third.map(element =>
          generalConfig.serverUrl + '/' + generalConfig.filesPath.userProfileDoc + element
        ) 
        empInfo['employment_proof'] = employmentProof;
        empInfo['sal_slip_first'] = salarySlipFirst; 
        empInfo['sal_slip_second'] = salarySlipSecond;
        empInfo['sal_slip_third'] = salarySlipThird;
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("Employement Proof Not found issue in Employement Proof image mapping")
    }
    callback();
  }
};

// Remove Profile Images 
var removeAdminPorfileImages = function (images) {  
  if (images) {
    const { profile_image } = images; 
      profile_image.map(element =>
        removeProfileImages(element)
      ) 
  }
}

function removeProfileImages(ProfileImage) {
  if (ProfileImage != undefined && ProfileImage != "") {
    var imagePath = path.resolve(generalConfig.filesPath.userPicture + ProfileImage);
    console.log("Remove Path: ",imagePath);
    fs.stat(imagePath, function (err, stat) {
      
      if (err == null) {
        fs.unlink(imagePath, function (err) {
          if (err) throw err;
          console.log('file deleted successfully');
        });
      }else if(err.code === 'ENOENT') {
        // file does not exist
          console.log("file does not exist");
        } else {
          console.log('Some other error: ', err.code);
        }
    });
  }
}

// Remove KYC Images  
var removeKycDetailImages = function (images) { 
  if (images) {
    console.log("Images: ",images);
    var { adhaar_front_image, adhaar_back_image, pan_card_image, selfee_image } = images; 
    if(adhaar_front_image){
      adhaar_front_image.map(element =>
        removeKycImages(element)
      )
    }
    if(adhaar_back_image){
      adhaar_back_image.map(element =>
        removeKycImages(element)
      )
    } 
    if(pan_card_image){
      pan_card_image.map(element =>
        removeKycImages(element)
      )
    }
    if(selfee_image){
      selfee_image.map(element =>
        removeKycImages(element)
      )
    } 
  }
} 

function removeKycImages(kycDetails) {
  if (kycDetails != undefined && kycDetails != "") {
    var imagePath = path.resolve(generalConfig.filesPath.kycImages + kycDetails);
    console.log("Remove Path: ",imagePath);
    fs.stat(imagePath, function (err, stat) {
      if (err == null) {
        fs.unlink(imagePath, function (err) {
          if (err) throw err;
          console.log('file deleted successfully');
        });
      }else if(err.code === 'ENOENT') {
        // file does not exist
          console.log("file does not exist");
        } else {
          console.log('Some other error: ', err.code);
        }
    });
  }
} 


// Remove College Id Images 
var removeCollegeDetailImages = function (images) {  
  if (images) { 
      images.map(element =>
        removeCollegeIdImages(element)
      ) 
  }
}

function removeCollegeIdImages(collegeIdImages) {
  if (collegeIdImages != undefined && collegeIdImages != "") {
    var imagePath = path.resolve(generalConfig.filesPath.userProfileDoc + collegeIdImages); 
    fs.stat(imagePath, function (err, stat) {
      if (err == null) {
        fs.unlink(imagePath, function (err) {
          if (err) throw err;
          console.log('file deleted successfully');
        });
      }else if(err.code === 'ENOENT') {
        // file does not exist
          console.log("file does not exist");
        } else {
          console.log('Some other error: ', err.code);
        }
    });
  }
}
// Get College Id Image.....

var getCollegeDetailImage = function (collegeDetail, callback) {
  if (collegeDetail) {
    //  Set Kyc Details Images url 
    if (collegeDetail) { 
      try {
        // fs.accessSync(imagePath);  
        var { college_id_image } = collegeDetail
        var collegeIdImage = college_id_image.map(element =>
          generalConfig.serverUrl + '/' + generalConfig.filesPath.userProfileDoc + element
        ) 
        collegeDetail['college_id_image'] = collegeIdImage;
         
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("College Details Not found issue in Employement Proof image mapping")
    }
    callback();
  }
};

 
var getKycDetailImage = function (kycDetail, callback) {
  if (kycDetail) {
    //  Set Kyc Details Images url 
    if (kycDetail) { 
      try {
        // fs.accessSync(imagePath);  
         var {adhaar_front_image, adhaar_back_image, pan_card_image, selfee_image } = kycDetail
        if(adhaar_front_image != null){
            var adhaarFrontImage = adhaar_front_image.map(element =>
              generalConfig.serverUrl + '/' + generalConfig.filesPath.kycImages + element
            )
            kycDetail['adhaar_front_image'] = adhaarFrontImage;
          }
          if(adhaar_back_image != null){
            var adhaarBackImage = adhaar_back_image.map(element =>
              generalConfig.serverUrl + '/' + generalConfig.filesPath.kycImages + element
            ) 
            kycDetail['adhaar_back_image'] = adhaarBackImage;
          }
          if(pan_card_image != null){
            var panCardImage = pan_card_image.map(element =>
              generalConfig.serverUrl + '/' + generalConfig.filesPath.kycImages + element
            ) 
            kycDetail['pan_card_image'] = panCardImage;
          }
          if(selfee_image != null){
            var selfeeImage = selfee_image.map(element =>
              generalConfig.serverUrl + '/' + generalConfig.filesPath.kycImages + element
            ) 
            kycDetail['selfee_image'] = selfeeImage; 
          }
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("Employement Proof Not found issue in Employement Proof image mapping")
    }
    callback();
  }
};

var getProFileImage = function (users, callback) { 
    //  Set Profile Images url 
    if (users) { 
      try {
        // fs.accessSync(imagePath);           
          console.log("Usersss: ",users);
          if(users.profile_image != null){
            var profileImage = users.profile_image.map(element =>
              generalConfig.serverUrl + '/' + generalConfig.filesPath.userPicture + element
            )
            console.log("Prooo: ", profileImage);
            users['profile_image'] = profileImage;
          } 
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("Profile Image Not found issue in Profile image mapping")
    }
    callback();
};

// Remove Bussiness Images  
var removeBusinessDetailImages = function (images) { 
  if (images) {
    console.log("Images: ",images);
    var { shop_image, shop_agree_image, cheque_leaf_image, bank_statement_image } = images; 
    if(shop_image){
      shop_image.map(element =>
        removeBusinessImages(element)
      )
    }
    if(shop_agree_image){
      shop_agree_image.map(element =>
        removeBusinessImages(element)
      )
    } 
    if(cheque_leaf_image){
      cheque_leaf_image.map(element =>
        removeBusinessImages(element)
      )
    }
    if(bank_statement_image){
      bank_statement_image.map(element =>
        removeBusinessImages(element)
      )
    } 
  }
} 

function removeBusinessImages(businessDetails) {
  if (businessDetails != undefined && businessDetails != "") {
    var imagePath = path.resolve(generalConfig.filesPath.userProfileDoc + businessDetails);
    console.log("Remove Path: ",imagePath);
    fs.stat(imagePath, function (err, stat) {
      if (err == null) {
        fs.unlink(imagePath, function (err) {
          if (err) throw err;
          console.log('file deleted successfully');
        });
      }else if(err.code === 'ENOENT') {
        // file does not exist
          console.log("file does not exist");
        } else {
          console.log('Some other error: ', err.code);
        }
    });
  }
} 

var getBusinessDetailImage = function (businessDetail, callback) {
  if (businessDetail) {
    //  Set Kyc Details Images url 
    if (businessDetail) { 
      try {
        // fs.accessSync(imagePath); 
        var {shop_image, shop_agree_image, cheque_leaf_image, bank_statement_image } = businessDetail
        if(shop_image != null){ 
            var shopImage = shop_image.map(element =>
              generalConfig.serverUrl + '/' + generalConfig.filesPath.userProfileDoc + element
            ) 
            businessDetail['shop_image'] = shopImage;
        }
        if(shop_agree_image != null){ 
          var shopAgreeImage = shop_agree_image.map(element =>
            generalConfig.serverUrl + '/' + generalConfig.filesPath.userProfileDoc + element
          )  
          businessDetail['shop_agree_image'] = shopAgreeImage;
        }
        if(cheque_leaf_image != null){ 
          var chequeLeafImage = cheque_leaf_image.map(element =>
            generalConfig.serverUrl + '/' + generalConfig.filesPath.userProfileDoc + element
          )  
          businessDetail['cheque_leaf_image'] = chequeLeafImage;
        }
        if(bank_statement_image != null){
          var bankStatementImage = bank_statement_image.map(element =>
            generalConfig.serverUrl + '/' + generalConfig.filesPath.userProfileDoc + element
          ) 
          businessDetail['bank_statement_image'] = bankStatementImage; 
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("Business details Not found issue in Employement Proof image mapping")
    }
    callback();
  }
};

 
module.exports = {
  checkUserEmailExistStatus : checkUserEmailExistStatus,
  loadProfileImages : loadProfileImages,
  removeProfilePicture : removeProfilePicture,
  storeProfilePicture : storeProfilePicture,
  getProfileImage : getProfileImage,
  getProFileImage: getProFileImage,
  output : output,
  removeEmpInfoImages : removeEmpInfoImages,
  getEmpProofImage : getEmpProofImage,
  removeAdminPorfileImages : removeAdminPorfileImages,
  removeKycDetailImages : removeKycDetailImages,
  getKycDetailImage : getKycDetailImage,
  removeCollegeDetailImages : removeCollegeDetailImages,
  getCollegeDetailImage : getCollegeDetailImage,
  removeBusinessDetailImages : removeBusinessDetailImages,
  getBusinessDetailImage : getBusinessDetailImage
}
