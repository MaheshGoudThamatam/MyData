'use strict';
/*
* <Author: Abha Singh>
* <Date:22-06-2016>
* <Routes: Create, Update, GetAll, GetSingle, Soft Delete for Document>
*/

/* jshint -W098 */
// The Package is past automatically as first parameter
 module.exports = function(Document, app, auth, database) {

	var documentCtrl = require('../controllers/document')(Document);
	  
	var authentication =  function(req, res, next) {
	  if (!req.user) {
	        return res.status(401).send('User is unauthorized to access this page.');
 	      } else {
 	    	next();
	  	    }
	  	};
	 // document upload API
	  	app.route('/api/document/file')
    	.post(documentCtrl.uploadDocumentFile);  	
	  	
	// document API  
	  app.route('/api/document')
	  	.post(authentication, documentCtrl.create);
	   
	  //fetching documents based on document category
	  app.route('/api/documents/:documentCategoryId')
	  	.get(authentication, documentCtrl.all);
	  	
	  app.route('/api/document/:documentId')
	    .put(authentication, documentCtrl.update)
 	    .get(authentication, documentCtrl.show)
 	    .delete(authentication, documentCtrl.delete);
 	 
 	 app.param('documentId', documentCtrl.document);
	  	
	};
