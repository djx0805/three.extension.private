(function () {
	'use strict';

	/**
	  * @author Kai Salmen / https://kaisalmen.de
	  * Development repository: https://github.com/kaisalmen/WWOBJLoader
	  */

	if ( THREE.LoaderSupport === undefined ) { THREE.LoaderSupport = {}; }

	/**
	 * Validation functions.
	 * @class
	 */
	THREE.LoaderSupport.Validator = {
		/**
		 * If given input is null or undefined, false is returned otherwise true.
		 *
		 * @param input Can be anything
		 * @returns {boolean}
		 */
		isValid: function( input ) {
			return ( input !== null && input !== undefined );
		},
		/**
		 * If given input is null or undefined, the defaultValue is returned otherwise the given input.
		 *
		 * @param input Can be anything
		 * @param defaultValue Can be anything
		 * @returns {*}
		 */
		verifyInput: function( input, defaultValue ) {
			return ( input === null || input === undefined ) ? defaultValue : input;
		}
	};


	/**
	 * Logging wrapper for console.
	 * @class
	 *
	 * @param {boolean} enabled=true Tell if logger is enabled.
	 * @param {boolean} debug=false Toggle debug logging.
	 */
	THREE.LoaderSupport.ConsoleLogger = (function () {

		function ConsoleLogger( enabled, debug ) {
			this.enabled = enabled !== false;
			this.debug = debug === true;
		}

		/**
		 * Enable or disable debug logging.
		 * @memberOf THREE.LoaderSupport.ConsoleLogger
		 *
		 * @param {boolean} debug True or False
		 */
		ConsoleLogger.prototype.setDebug = function ( debug ) {
			this.debug = debug === true;
		};

		/**
		 * Returns if is enabled and debug.
		 * @memberOf THREE.LoaderSupport.ConsoleLogger
		 *
		 * @returns {boolean}
		 */
		ConsoleLogger.prototype.isDebug = function () {
			return this.isEnabled() && this.debug;
		};

		/**
		 * Enable or disable info, debug and time logging.
		 * @memberOf THREE.LoaderSupport.ConsoleLogger
		 *
		 * @param {boolean} enabled True or False
		 */
		ConsoleLogger.prototype.setEnabled = function ( enabled ) {
			this.enabled = enabled === true;
		};

		/**
		 * Returns if is enabled.
		 * @memberOf THREE.LoaderSupport.ConsoleLogger
		 *
		 * @returns {boolean}
		 */
		ConsoleLogger.prototype.isEnabled = function () {
			return this.enabled;
		};

		/**
		 * Log a debug message if enabled and debug is set.
		 * @memberOf THREE.LoaderSupport.ConsoleLogger
		 *
		 * @param {string} message Message to log
		 * @param {string[]} additional Array of strings containing additional content to be logged
		 *
		 */
		ConsoleLogger.prototype.logDebug = function ( message, additional ) {
			if ( this.enabled && this.debug ) {

				this._createStatement( message, 'Additional content:', additional, function ( output ) { console.debug( output ); } );

			}
		};

		/**
		 * Log an info message if enabled.
		 * @memberOf THREE.LoaderSupport.ConsoleLogger
		 *
		 * @param {string} message Message to log
		 * @param {string[]} additional Array of strings containing additional content to be logged
		 */
		ConsoleLogger.prototype.logInfo = function ( message, additional ) {
			if ( this.enabled ) {

				this._createStatement( message, 'Additional content:', additional, function ( output ) { console.info( output ); } );

			}
		};

		/**
		 * Log a warn message (always).
		 * @memberOf THREE.LoaderSupport.ConsoleLogger
		 *
		 * @param {string} message Message to log
		 * @param {string[]} additional Array of strings containing additional content to be logged
		 */
		ConsoleLogger.prototype.logWarn = function ( message, additional ) {
			this._createStatement( message, 'Additional content:', additional, function ( output ) { console.warn( output ); } );
		};

		/**
		 * Log an error message (always).
		 * @memberOf THREE.LoaderSupport.ConsoleLogger
		 *
		 * @param {string} message Message to log
		 * @param {string[]} additional Array of strings containing additional content to be logged
		 */
		ConsoleLogger.prototype.logError = function ( message, additional ) {
			this._createStatement( message, 'Additional content:', additional, function ( output ) { console.error( output ); } );
		};

		/**
		 * Start time measurement with provided id.
		 * @memberOf THREE.LoaderSupport.ConsoleLogger
		 *
		 * @param {string} id Time identification
		 */
		ConsoleLogger.prototype.logTimeStart = function ( id ) {
			if ( this.enabled ) console.time( id );
		};

		/**
		 * Stop time measurement started with provided id.
		 * @memberOf THREE.LoaderSupport.ConsoleLogger
		 *
		 * @param {string} id Time identification
		 */
		ConsoleLogger.prototype.logTimeEnd = function ( id ) {
			if ( this.enabled ) console.timeEnd( id );
		};

		ConsoleLogger.prototype._createStatement = function ( message, addHeader, additional, logFunction ) {
			var output = message;
			if ( Array.isArray( additional ) ) {

				output += '\n' + addHeader + '\n' + additional.join( '\n' );

			}
			logFunction( output );
		};

		return ConsoleLogger;
	})();

	/**
	 * Callbacks utilized by loaders and builder.
	 * @class
	 */
	THREE.LoaderSupport.Callbacks = (function () {

		var Validator = THREE.LoaderSupport.Validator;

		function Callbacks() {
			this.onProgress = null;
			this.onMeshAlter = null;
			this.onLoad = null;
			this.onLoadMaterials = null;
		}

		/**
		 * Register callback function that is invoked by internal function "announceProgress" to print feedback.
		 * @memberOf THREE.LoaderSupport.Callbacks
		 *
		 * @param {callback} callbackOnProgress Callback function for described functionality
		 */
		Callbacks.prototype.setCallbackOnProgress = function ( callbackOnProgress ) {
			this.onProgress = Validator.verifyInput( callbackOnProgress, this.onProgress );
		};

		/**
		 * Register callback function that is called every time a mesh was loaded.
		 * Use {@link THREE.LoaderSupport.LoadedMeshUserOverride} for alteration instructions (geometry, material or disregard mesh).
		 * @memberOf THREE.LoaderSupport.Callbacks
		 *
		 * @param {callback} callbackOnMeshAlter Callback function for described functionality
		 */
		Callbacks.prototype.setCallbackOnMeshAlter = function ( callbackOnMeshAlter ) {
			this.onMeshAlter = Validator.verifyInput( callbackOnMeshAlter, this.onMeshAlter );
		};

		/**
		 * Register callback function that is called once loading of the complete OBJ file is completed.
		 * @memberOf THREE.LoaderSupport.Callbacks
		 *
		 * @param {callback} callbackOnLoad Callback function for described functionality
		 */
		Callbacks.prototype.setCallbackOnLoad = function ( callbackOnLoad ) {
			this.onLoad = Validator.verifyInput( callbackOnLoad, this.onLoad );
		};

		/**
		 * Register callback function that is called when materials have been loaded.
		 * @memberOf THREE.LoaderSupport.Callbacks
		 *
		 * @param {callback} callbackOnLoadMaterials Callback function for described functionality
		 */
		Callbacks.prototype.setCallbackOnLoadMaterials = function ( callbackOnLoadMaterials ) {
			this.onLoadMaterials = Validator.verifyInput( callbackOnLoadMaterials, this.onLoadMaterials );
		};

		return Callbacks;
	})();


	/**
	 * Object to return by callback onMeshAlter. Used to disregard a certain mesh or to return one to many meshes.
	 * @class
	 *
	 * @param {boolean} disregardMesh=false Tell implementation to completely disregard this mesh
	 * @param {boolean} disregardMesh=false Tell implementation that mesh(es) have been altered or added
	 */
	THREE.LoaderSupport.LoadedMeshUserOverride = (function () {

		function LoadedMeshUserOverride( disregardMesh, alteredMesh ) {
			this.disregardMesh = disregardMesh === true;
			this.alteredMesh = alteredMesh === true;
			this.meshes = [];
		}

		/**
		 * Add a mesh created within callback.
		 *
		 * @memberOf THREE.OBJLoader2.LoadedMeshUserOverride
		 *
		 * @param {THREE.Mesh} mesh
		 */
		LoadedMeshUserOverride.prototype.addMesh = function ( mesh ) {
			this.meshes.push( mesh );
			this.alteredMesh = true;
		};

		/**
		 * Answers if mesh shall be disregarded completely.
		 *
		 * @returns {boolean}
		 */
		LoadedMeshUserOverride.prototype.isDisregardMesh = function () {
			return this.disregardMesh;
		};

		/**
		 * Answers if new mesh(es) were created.
		 *
		 * @returns {boolean}
		 */
		LoadedMeshUserOverride.prototype.providesAlteredMeshes = function () {
			return this.alteredMesh;
		};

		return LoadedMeshUserOverride;
	})();


	/**
	 * A resource description used by {@link THREE.LoaderSupport.PrepData} and others.
	 * @class
	 *
	 * @param {string} url URL to the file
	 * @param {string} extension The file extension (type)
	 */
	THREE.LoaderSupport.ResourceDescriptor = (function () {

		var Validator = THREE.LoaderSupport.Validator;

		function ResourceDescriptor( url, extension ) {
			var urlParts = url.split( '/' );

			if ( urlParts.length < 2 ) {

				this.path = null;
				this.name = url;
				this.url = url;

			} else {

				this.path = Validator.verifyInput( urlParts.slice( 0, urlParts.length - 1).join( '/' ) + '/', null );
				this.name = Validator.verifyInput( urlParts[ urlParts.length - 1 ], null );
				this.url = url;

			}
			this.extension = Validator.verifyInput( extension, "default" );
			this.extension = this.extension.trim();
			this.content = null;
		}

		/**
		 * Set the content of this resource (String)
		 * @memberOf THREE.LoaderSupport.ResourceDescriptor
		 *
		 * @param {Object} content The file content as arraybuffer or text
		 */
		ResourceDescriptor.prototype.setContent = function ( content ) {
			this.content = Validator.verifyInput( content, null );
		};

		return ResourceDescriptor;
	})();


	/**
	 * Configuration instructions to be used by run method.
	 * @class
	 */
	THREE.LoaderSupport.PrepData = (function () {

		var Validator = THREE.LoaderSupport.Validator;

		function PrepData( modelName ) {
			this.modelName = Validator.verifyInput( modelName, '' );
			this.resources = [];
			this.streamMeshesTo = null;
			this.materialPerSmoothingGroup = false;
			this.useIndices = false;
			this.disregardNormals = false;
			this.callbacks = new THREE.LoaderSupport.Callbacks();
			this.crossOrigin;
			this.useAsync = false;
		}

		/**
		 * Set the node where the loaded objects will be attached directly.
		 * @memberOf THREE.LoaderSupport.PrepData
		 *
		 * @param {THREE.Object3D} streamMeshesTo Object already attached to scenegraph where new meshes will be attached to
		 */
		PrepData.prototype.setStreamMeshesTo = function ( streamMeshesTo ) {
			this.streamMeshesTo = Validator.verifyInput( streamMeshesTo, null );
		};

		/**
		 * Tells whether a material shall be created per smoothing group.
		 * @memberOf THREE.LoaderSupport.PrepData
		 *
		 * @param {boolean} materialPerSmoothingGroup=false
		 */
		PrepData.prototype.setMaterialPerSmoothingGroup = function ( materialPerSmoothingGroup ) {
			this.materialPerSmoothingGroup = materialPerSmoothingGroup === true;
		};

		/**
		 * Tells whether indices should be used
		 * @memberOf THREE.LoaderSupport.PrepData
		 *
		 * @param {boolean} useIndices=false
		 */
		PrepData.prototype.setUseIndices = function ( useIndices ) {
			this.useIndices = useIndices === true;
		};

		/**
		 * Tells whether normals should be completely disregarded and regenerated.
		 * @memberOf THREE.LoaderSupport.PrepData
		 *
		 * @param {boolean} disregardNormals=false
		 */
		PrepData.prototype.setDisregardNormals = function ( disregardNormals ) {
			this.disregardNormals = disregardNormals === true;
		};

		/**
		 * Returns all callbacks as {@link THREE.LoaderSupport.Callbacks}
		 * @memberOf THREE.LoaderSupport.PrepData
		 *
		 * @returns {THREE.LoaderSupport.Callbacks}
		 */
		PrepData.prototype.getCallbacks = function () {
			return this.callbacks;
		};

		/**
		 * Sets the CORS string to be used.
		 * @memberOf THREE.LoaderSupport.PrepData
		 *
		 * @param {string} crossOrigin CORS value
		 */
		PrepData.prototype.setCrossOrigin = function ( crossOrigin ) {
			this.crossOrigin = crossOrigin;
		};

		/**
		 * Add a resource description.
		 * @memberOf THREE.LoaderSupport.PrepData
		 *
		 * @param {THREE.LoaderSupport.ResourceDescriptor}
		 */
		PrepData.prototype.addResource = function ( resource ) {
			this.resources.push( resource );
		};

		/**
		 * If true uses async loading with worker, if false loads data synchronously.
		 * @memberOf THREE.LoaderSupport.PrepData
		 *
		 * @param {boolean} useAsync
		 */
		PrepData.prototype.setUseAsync = function ( useAsync ) {
			this.useAsync = useAsync === true;
		};

		/**
		 * Clones this object and returns it afterwards.
		 * @memberOf THREE.LoaderSupport.PrepData
		 *
		 * @returns {@link THREE.LoaderSupport.PrepData}
		 */
		PrepData.prototype.clone = function () {
			var clone = new THREE.LoaderSupport.PrepData( this.modelName );
			clone.resources = this.resources;
			clone.streamMeshesTo = this.streamMeshesTo;
			clone.materialPerSmoothingGroup = this.materialPerSmoothingGroup;
			clone.useIndices = this.useIndices;
			clone.disregardNormals = this.disregardNormals;
			clone.callbacks = this.callbacks;
			clone.crossOrigin = this.crossOrigin;
			clone.useAsync = this.useAsync;
			return clone;
		};

		return PrepData;
	})();

	/**
	 * Builds one or many THREE.Mesh from one raw set of Arraybuffers, materialGroup descriptions and further parameters.
	 * Supports vertex, vertexColor, normal, uv and index buffers.
	 * @class
	 */
	THREE.LoaderSupport.Builder = (function () {

		var LOADER_BUILDER_VERSION = '1.1.1';

		var Validator = THREE.LoaderSupport.Validator;
		var ConsoleLogger = THREE.LoaderSupport.ConsoleLogger;

		function Builder( logger ) {
			this.logger = Validator.verifyInput( logger, new ConsoleLogger() );
			this.logger.logInfo( 'Using THREE.LoaderSupport.Builder version: ' + LOADER_BUILDER_VERSION );
			this.callbacks = new THREE.LoaderSupport.Callbacks();
			this.materials = [];
			this._createDefaultMaterials();
		}

		Builder.prototype._createDefaultMaterials = function () {
			var defaultMaterial = new THREE.MeshStandardMaterial( { color: 0xDCF1FF } );
			defaultMaterial.name = 'defaultMaterial';

			var defaultVertexColorMaterial = new THREE.MeshStandardMaterial( { color: 0xDCF1FF } );
			defaultVertexColorMaterial.name = 'defaultVertexColorMaterial';
			defaultVertexColorMaterial.vertexColors = THREE.VertexColors;

			var defaultLineMaterial = new THREE.LineBasicMaterial();
			defaultLineMaterial.name = 'defaultLineMaterial';

			var defaultPointMaterial = new THREE.PointsMaterial( { size: 1, sizeAttenuation: false } );
			defaultPointMaterial.name = 'defaultPointMaterial';

			var runtimeMaterials = {};
			runtimeMaterials[ defaultMaterial.name ] = defaultMaterial;
			runtimeMaterials[ defaultVertexColorMaterial.name ] = defaultVertexColorMaterial;
			runtimeMaterials[ defaultLineMaterial.name ] = defaultLineMaterial;
			runtimeMaterials[ defaultPointMaterial.name ] = defaultPointMaterial;

			this.updateMaterials(
				{
					cmd: 'materialData',
					materials: {
						materialCloneInstructions: null,
						serializedMaterials: null,
						runtimeMaterials: runtimeMaterials
					}
				}
			);
		};

		/**
		 * Set materials loaded by any supplier of an Array of {@link THREE.Material}.
		 * @memberOf THREE.LoaderSupport.Builder
		 *
		 * @param {THREE.Material[]} materials Array of {@link THREE.Material}
		 */
		Builder.prototype.setMaterials = function ( materials ) {
			var payload = {
				cmd: 'materialData',
				materials: {
					materialCloneInstructions: null,
					serializedMaterials: null,
					runtimeMaterials: Validator.isValid( this.callbacks.onLoadMaterials ) ? this.callbacks.onLoadMaterials( materials ) : materials
				}
			};
			this.updateMaterials( payload );
		};

		Builder.prototype._setCallbacks = function ( callbacks ) {
			if ( Validator.isValid( callbacks.onProgress ) ) this.callbacks.setCallbackOnProgress( callbacks.onProgress );
			if ( Validator.isValid( callbacks.onMeshAlter ) ) this.callbacks.setCallbackOnMeshAlter( callbacks.onMeshAlter );
			if ( Validator.isValid( callbacks.onLoad ) ) this.callbacks.setCallbackOnLoad( callbacks.onLoad );
			if ( Validator.isValid( callbacks.onLoadMaterials ) ) this.callbacks.setCallbackOnLoadMaterials( callbacks.onLoadMaterials );
		};

		/**
		 * Delegates processing of the payload (mesh building or material update) to the corresponding functions (BW-compatibility).
		 * @memberOf THREE.LoaderSupport.Builder
		 *
		 * @param {Object} payload Raw Mesh or Material descriptions.
		 * @returns {THREE.Mesh[]} mesh Array of {@link THREE.Mesh} or null in case of material update
		 */
		Builder.prototype.processPayload = function ( payload ) {
			if ( payload.cmd === 'meshData' ) {

				return this.buildMeshes( payload );

			} else if ( payload.cmd === 'materialData' ) {

				this.updateMaterials( payload );
				return null;

			}
		};

		/**
		 * Builds one or multiple meshes from the data described in the payload (buffers, params, material info).
		 * @memberOf THREE.LoaderSupport.Builder
		 *
		 * @param {Object} meshPayload Raw mesh description (buffers, params, materials) used to build one to many meshes.
		 * @returns {THREE.Mesh[]} mesh Array of {@link THREE.Mesh}
		 */
		Builder.prototype.buildMeshes = function ( meshPayload ) {
			var meshName = meshPayload.params.meshName;

			var bufferGeometry = new THREE.BufferGeometry();
			bufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.vertices ), 3 ) );
			if ( Validator.isValid( meshPayload.buffers.indices ) ) {

				bufferGeometry.setIndex( new THREE.BufferAttribute( new Uint32Array( meshPayload.buffers.indices ), 1 ));

			}
			var haveVertexColors = Validator.isValid( meshPayload.buffers.colors );
			if ( haveVertexColors ) {

				bufferGeometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.colors ), 3 ) );

			}
			if ( Validator.isValid( meshPayload.buffers.normals ) ) {

				bufferGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.normals ), 3 ) );

			} else {

				bufferGeometry.computeVertexNormals();

			}
			if ( Validator.isValid( meshPayload.buffers.uvs ) ) {

				bufferGeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( meshPayload.buffers.uvs ), 2 ) );

			}

			var material, materialName, key;
			var materialNames = meshPayload.materials.materialNames;
			var createMultiMaterial = meshPayload.materials.multiMaterial;
			var multiMaterials = [];
			for ( key in materialNames ) {

				materialName = materialNames[ key ];
				material = this.materials[ materialName ];
				if ( createMultiMaterial ) multiMaterials.push( material );

			}
			if ( createMultiMaterial ) {

				material = multiMaterials;
				var materialGroups = meshPayload.materials.materialGroups;
				var materialGroup;
				for ( key in materialGroups ) {

					materialGroup = materialGroups[ key ];
					bufferGeometry.addGroup( materialGroup.start, materialGroup.count, materialGroup.index );

				}

			}

			var meshes = [];
			var mesh;
			var callbackOnMeshAlter = this.callbacks.onMeshAlter;
			var callbackOnMeshAlterResult;
			var useOrgMesh = true;
			var geometryType = Validator.verifyInput( meshPayload.geometryType, 0 );
			if ( Validator.isValid( callbackOnMeshAlter ) ) {

				callbackOnMeshAlterResult = callbackOnMeshAlter(
					{
						detail: {
							meshName: meshName,
							bufferGeometry: bufferGeometry,
							material: material,
							geometryType: geometryType
						}
					}
				);
				if ( Validator.isValid( callbackOnMeshAlterResult ) ) {

					if ( ! callbackOnMeshAlterResult.isDisregardMesh() && callbackOnMeshAlterResult.providesAlteredMeshes() ) {

						for ( var i in callbackOnMeshAlterResult.meshes ) {

							meshes.push( callbackOnMeshAlterResult.meshes[ i ] );

						}

					}
					useOrgMesh = false;

				}

			}
			if ( useOrgMesh ) {

				if ( meshPayload.computeBoundingSphere ) bufferGeometry.computeBoundingSphere();
				if ( geometryType === 0 ) {

					mesh = new THREE.Mesh( bufferGeometry, material );

				} else if ( geometryType === 1) {

					mesh = new THREE.LineSegments( bufferGeometry, material );

				} else {

					mesh = new THREE.Points( bufferGeometry, material );

				}
				mesh.name = meshName;
				meshes.push( mesh );

			}

			var progressMessage;
			if ( Validator.isValid( meshes ) && meshes.length > 0 ) {

				var meshNames = [];
				for ( var i in meshes ) {

					mesh = meshes[ i ];
					meshNames[ i ] = mesh.name;

				}
				progressMessage = 'Adding mesh(es) (' + meshNames.length + ': ' + meshNames + ') from input mesh: ' + meshName;
				progressMessage += ' (' + ( meshPayload.progress.numericalValue * 100 ).toFixed( 2 ) + '%)';

			} else {

				progressMessage = 'Not adding mesh: ' + meshName;
				progressMessage += ' (' + ( meshPayload.progress.numericalValue * 100 ).toFixed( 2 ) + '%)';

			}
			var callbackOnProgress = this.callbacks.onProgress;
			if ( Validator.isValid( callbackOnProgress ) ) {

				var event = new CustomEvent( 'BuilderEvent', {
					detail: {
						type: 'progress',
						modelName: meshPayload.params.meshName,
						text: progressMessage,
						numericalValue: meshPayload.progress.numericalValue
					}
				} );
				callbackOnProgress( event );

			}

			return meshes;
		};

		/**
		 * Updates the materials with contained material objects (sync) or from alteration instructions (async).
		 * @memberOf THREE.LoaderSupport.Builder
		 *
		 * @param {Object} materialPayload Material update instructions
		 */
		Builder.prototype.updateMaterials = function ( materialPayload ) {
			var material, materialName;
			var materialCloneInstructions = materialPayload.materials.materialCloneInstructions;
			if ( Validator.isValid( materialCloneInstructions ) ) {

				var materialNameOrg = materialCloneInstructions.materialNameOrg;
				var materialOrg = this.materials[ materialNameOrg ];

				if ( Validator.isValid( materialNameOrg ) ) {

					material = materialOrg.clone();

					materialName = materialCloneInstructions.materialName;
					material.name = materialName;

					var materialProperties = materialCloneInstructions.materialProperties;
					for ( var key in materialProperties ) {

						if ( material.hasOwnProperty( key ) && materialProperties.hasOwnProperty( key ) ) material[ key ] = materialProperties[ key ];

					}
					this.materials[ materialName ] = material;

				} else {

					this.logger.logWarn( 'Requested material "' + materialNameOrg + '" is not available!' );

				}
			}

			var materials = materialPayload.materials.serializedMaterials;
			if ( Validator.isValid( materials ) && Object.keys( materials ).length > 0 ) {

				var loader = new THREE.MaterialLoader();
				var materialJson;
				for ( materialName in materials ) {

					materialJson = materials[ materialName ];
					if ( Validator.isValid( materialJson ) ) {

						material = loader.parse( materialJson );
						this.logger.logInfo( 'De-serialized material with name "' + materialName + '" will be added.' );
						this.materials[ materialName ] = material;
					}

				}

			}

			materials = materialPayload.materials.runtimeMaterials;
			if ( Validator.isValid( materials ) && Object.keys( materials ).length > 0 ) {

				for ( materialName in materials ) {

					material = materials[ materialName ];
					this.logger.logInfo( 'Material with name "' + materialName + '" will be added.' );
					this.materials[ materialName ] = material;

				}

			}
		};

		/**
		 * Returns the mapping object of material name and corresponding jsonified material.
		 *
		 * @returns {Object} Map of Materials in JSON representation
		 */
		Builder.prototype.getMaterialsJSON = function () {
			var materialsJSON = {};
			var material;
			for ( var materialName in this.materials ) {

				material = this.materials[ materialName ];
				materialsJSON[ materialName ] = material.toJSON();
			}

			return materialsJSON;
		};

		/**
		 * Returns the mapping object of material name and corresponding material.
		 *
		 * @returns {Object} Map of {@link THREE.Material}
		 */
		Builder.prototype.getMaterials = function () {
			return this.materials;
		};

		return Builder;
	})();

	/**
	 * Base class to be used by Loaders that provide load, parse, parseAsync and run
	 * @class
	 *
	 * @param {THREE.DefaultLoadingManager} [manager] The loadingManager for the loader to use. Default is {@link THREE.DefaultLoadingManager}
	 * @param {THREE.LoaderSupport.ConsoleLogger} logger logger to be used
	 */
	THREE.LoaderSupport.LoaderBase = (function () {

		var Validator = THREE.LoaderSupport.Validator;
		var ConsoleLogger = THREE.LoaderSupport.ConsoleLogger;

		function LoaderBase( manager, logger ) {
			this.manager = Validator.verifyInput( manager, THREE.DefaultLoadingManager );
			this.logger = Validator.verifyInput( logger, new ConsoleLogger() );

			this.fileLoader = new THREE.FileLoader( this.manager );
			this.fileLoader.setResponseType( 'arraybuffer' );

			this.modelName = '';
			this.instanceNo = 0;
			this.path = '';
			this.useIndices = false;
			this.disregardNormals = false;

			this.loaderRootNode = new THREE.Group();
			this.builder = new THREE.LoaderSupport.Builder( this.logger );
			this.callbacks = new THREE.LoaderSupport.Callbacks();
		}

		LoaderBase.prototype._applyPrepData = function ( prepData ) {
			if ( Validator.isValid( prepData ) ) {

				this.setModelName( prepData.modelName );
				this.setStreamMeshesTo( prepData.streamMeshesTo );
				this.builder.setMaterials( prepData.materials );
				this.setUseIndices( prepData.useIndices );
				this.setDisregardNormals( prepData.disregardNormals );

				this._setCallbacks( prepData.getCallbacks() );
			}
		};

		LoaderBase.prototype._setCallbacks = function ( callbacks ) {
			if ( Validator.isValid( callbacks.onProgress ) ) this.callbacks.setCallbackOnProgress( callbacks.onProgress );
			if ( Validator.isValid( callbacks.onMeshAlter ) ) this.callbacks.setCallbackOnMeshAlter( callbacks.onMeshAlter );
			if ( Validator.isValid( callbacks.onLoad ) ) this.callbacks.setCallbackOnLoad( callbacks.onLoad );
			if ( Validator.isValid( callbacks.onLoadMaterials ) ) this.callbacks.setCallbackOnLoadMaterials( callbacks.onLoadMaterials );

			this.builder._setCallbacks( this.callbacks );
		};

		/**
		 * Provides access to console logging wrapper.
		 *
		 * @returns {THREE.LoaderSupport.ConsoleLogger}
		 */
		LoaderBase.prototype.getLogger = function () {
			return this.logger;
		};

		/**
		 * Set the name of the model.
		 * @memberOf THREE.LoaderSupport.LoaderBase
		 *
		 * @param {string} modelName
		 */
		LoaderBase.prototype.setModelName = function ( modelName ) {
			this.modelName = Validator.verifyInput( modelName, this.modelName );
		};

		/**
		 * The URL of the base path.
		 * @memberOf THREE.LoaderSupport.LoaderBase
		 *
		 * @param {string} path URL
		 */
		LoaderBase.prototype.setPath = function ( path ) {
			this.path = Validator.verifyInput( path, this.path );
		};

		/**
		 * Set the node where the loaded objects will be attached directly.
		 * @memberOf THREE.LoaderSupport.LoaderBase
		 *
		 * @param {THREE.Object3D} streamMeshesTo Object already attached to scenegraph where new meshes will be attached to
		 */
		LoaderBase.prototype.setStreamMeshesTo = function ( streamMeshesTo ) {
			this.loaderRootNode = Validator.verifyInput( streamMeshesTo, this.loaderRootNode );
		};

		/**
		 * Set materials loaded by MTLLoader or any other supplier of an Array of {@link THREE.Material}.
		 * @memberOf THREE.LoaderSupport.LoaderBase
		 *
		 * @param {THREE.Material[]} materials Array of {@link THREE.Material}
		 */
		LoaderBase.prototype.setMaterials = function ( materials ) {
			this.builder.setMaterials( materials );
		};

		/**
		 * Instructs loaders to create indexed {@link THREE.BufferGeometry}.
		 * @memberOf THREE.LoaderSupport.LoaderBase
		 *
		 * @param {boolean} useIndices=false
		 */
		LoaderBase.prototype.setUseIndices = function ( useIndices ) {
			this.useIndices = useIndices === true;
		};

		/**
		 * Tells whether normals should be completely disregarded and regenerated.
		 * @memberOf THREE.LoaderSupport.LoaderBase
		 *
		 * @param {boolean} disregardNormals=false
		 */
		LoaderBase.prototype.setDisregardNormals = function ( disregardNormals ) {
			this.disregardNormals = disregardNormals === true;
		};

		/**
		 * Announce feedback which is give to the registered callbacks.
		 * @memberOf THREE.LoaderSupport.LoaderBase
		 * @private
		 *
		 * @param {string} type The type of event
		 * @param {string} text Textual description of the event
		 * @param {number} numericalValue Numerical value describing the progress
		 */
		LoaderBase.prototype.onProgress = function ( type, text, numericalValue ) {
			var content = Validator.isValid( text ) ? text: '';
			var event = {
				detail: {
					type: type,
					modelName: this.modelName,
					instanceNo: this.instanceNo,
					text: content,
					numericalValue: numericalValue
				}
			};

			if ( Validator.isValid( this.callbacks.onProgress ) ) this.callbacks.onProgress( event );

			this.logger.logDebug( content );
		};

		/**
		 * Use this convenient method to load a file at the given URL. By default the fileLoader uses an ArrayBuffer.
		 * @memberOf THREE.LoaderSupport.LoaderBase
		 *
		 * @param {string}  url A string containing the path/URL of the file to be loaded.
		 * @param {callback} onLoad A function to be called after loading is successfully completed. The function receives loaded Object3D as an argument.
		 * @param {callback} [onProgress] A function to be called while the loading is in progress. The argument will be the XMLHttpRequest instance, which contains total and Integer bytes.
		 * @param {callback} [onError] A function to be called if an error occurs during loading. The function receives the error as an argument.
		 * @param {callback} [onMeshAlter] A function to be called after a new mesh raw data becomes available for alteration.
		 * @param {boolean} [useAsync] If true, uses async loading with worker, if false loads data synchronously.
		 */
		LoaderBase.prototype.load = function ( url, onLoad, onProgress, onError, onMeshAlter, useAsync ) {
			var scope = this;
			if ( ! Validator.isValid( onProgress ) ) {
				var numericalValueRef = 0;
				var numericalValue = 0;
				onProgress = function ( event ) {
					if ( ! event.lengthComputable ) return;

					numericalValue = event.loaded / event.total;
					if ( numericalValue > numericalValueRef ) {

						numericalValueRef = numericalValue;
						var output = 'Download of "' + url + '": ' + ( numericalValue * 100 ).toFixed( 2 ) + '%';
						scope.onProgress( 'progressLoad', output, numericalValue );

					}
				};
			}

			if ( ! Validator.isValid( onError ) ) {
				onError = function ( event ) {
					var output = 'Error occurred while downloading "' + url + '"';
					scope.logger.logError( output + ': ' + event );
					scope.onProgress( 'error', output, -1 );
				};
			}

			this.fileLoader.setPath( this.path );
			this.fileLoader.load( url, function ( content ) {
				if ( useAsync ) {

					scope.parseAsync( content, onLoad );

				} else {

					var callbacks = new THREE.LoaderSupport.Callbacks();
					callbacks.setCallbackOnMeshAlter( onMeshAlter );
					scope._setCallbacks( callbacks );
					onLoad(
						{
							detail: {
								loaderRootNode: scope.parse( content ),
								modelName: scope.modelName,
								instanceNo: scope.instanceNo
							}
						}
					);

				}

			}, onProgress, onError );

		};

		/**
		 * Identify files or content of interest from an Array of {@link THREE.LoaderSupport.ResourceDescriptor}.
		 *
		 * @param {THREE.LoaderSupport.ResourceDescriptor[]} resources Array of {@link THREE.LoaderSupport.ResourceDescriptor}
		 * @param Object fileDesc Object describing which resources are of interest (ext, type (string or UInt8Array) and ignore (boolean))
		 * @returns {{}} Object with each "ext" and the corresponding {@link THREE.LoaderSupport.ResourceDescriptor}
		 */
		LoaderBase.prototype.checkResourceDescriptorFiles = function ( resources, fileDesc ) {
			var resource, triple, i, found;
			var result = {};

			for ( var index in resources ) {

				resource = resources[ index ];
				found = false;
				if ( ! Validator.isValid( resource.name ) ) continue;
				if ( Validator.isValid( resource.content ) ) {

					for ( i = 0; i < fileDesc.length && !found; i++ ) {

						triple = fileDesc[ i ];
						if ( resource.extension.toLowerCase() === triple.ext.toLowerCase() ) {

							if ( triple.ignore ) {

								found = true;

							} else if ( triple.type === "Uint8Array" ) {

								// fast-fail on bad type
								if ( ! ( resource.content instanceof Uint8Array ) ) throw 'Provided content is not of type arraybuffer! Aborting...';
								result[ triple.ext ] = resource;
								found = true;

							} else if ( triple.type === "String" ) {

								if ( ! (typeof(resource.content) === 'string' || resource.content instanceof String) ) throw 'Provided  content is not of type String! Aborting...';
								result[ triple.ext ] = resource;
								found = true;

							}

						}

					}
					if ( !found ) throw 'Unidentified resource "' + resource.name + '": ' + resource.url;

				} else {

					// fast-fail on bad type
					if ( ! ( typeof( resource.name ) === 'string' || resource.name instanceof String ) ) throw 'Provided file is not properly defined! Aborting...';
					for ( i = 0; i < fileDesc.length && !found; i++ ) {

						triple = fileDesc[ i ];
						if ( resource.extension.toLowerCase() === triple.ext.toLowerCase() ) {

							if ( ! triple.ignore ) result[ triple.ext ] = resource;
							found = true;

						}

					}
					if ( !found ) throw 'Unidentified resource "' + resource.name + '": ' + resource.url;

				}
			}

			return result;
		};

		return LoaderBase;
	})();

	/**
	 * Default implementation of the WorkerRunner responsible for creation and configuration of the parser within the worker.
	 *
	 * @class
	 */
	THREE.LoaderSupport.WorkerRunnerRefImpl = (function () {

		function WorkerRunnerRefImpl() {
			var scope = this;
			var scopedRunner = function( event ) {
				scope.processMessage( event.data );
			};
			self.addEventListener( 'message', scopedRunner, false );
		}

		/**
		 * Applies values from parameter object via set functions or via direct assignment.
		 * @memberOf THREE.LoaderSupport.WorkerRunnerRefImpl
		 *
		 * @param {Object} parser The parser instance
		 * @param {Object} params The parameter object
		 */
		WorkerRunnerRefImpl.prototype.applyProperties = function ( parser, params ) {
			var property, funcName, values;
			for ( property in params ) {
				funcName = 'set' + property.substring( 0, 1 ).toLocaleUpperCase() + property.substring( 1 );
				values = params[ property ];

				if ( typeof parser[ funcName ] === 'function' ) {

					parser[ funcName ]( values );

				} else if ( parser.hasOwnProperty( property ) ) {

					parser[ property ] = values;

				}
			}
		};

		/**
		 * Configures the Parser implementation according the supplied configuration object.
		 * @memberOf THREE.LoaderSupport.WorkerRunnerRefImpl
		 *
		 * @param {Object} payload Raw mesh description (buffers, params, materials) used to build one to many meshes.
		 */
		WorkerRunnerRefImpl.prototype.processMessage = function ( payload ) {
			var logEnabled = payload.logger.enabled;
			var logDebug = payload.logger.enabled;
			if ( payload.cmd === 'run' ) {

				var callbacks = {
					callbackBuilder: function ( payload ) {
						self.postMessage( payload );
					},
					callbackProgress: function ( text ) {
						if ( logEnabled && logDebug ) console.debug( 'WorkerRunner: progress: ' + text );
					}
				};

				// Parser is expected to be named as such
				var parser = new Parser();
				if ( typeof parser[ 'setLogConfig' ] === 'function' ) parser.setLogConfig( logEnabled, logDebug );
				this.applyProperties( parser, payload.params );
				this.applyProperties( parser, payload.materials );
				this.applyProperties( parser, callbacks );
				parser.workerScope = self;
				parser.parse( payload.data.input, payload.data.options );

				if ( logEnabled ) console.log( 'WorkerRunner: Run complete!' );

				callbacks.callbackBuilder( {
					cmd: 'complete',
					msg: 'WorkerRunner completed run.'
				} );

			} else {

				console.error( 'WorkerRunner: Received unknown command: ' + payload.cmd );

			}
		};

		return WorkerRunnerRefImpl;
	})();

	/**
	 * This class provides means to transform existing parser code into a web worker. It defines a simple communication protocol
	 * which allows to configure the worker and receive raw mesh data during execution.
	 * @class
	 *
	 * @param {THREE.LoaderSupport.ConsoleLogger} logger logger to be used
	 */
	THREE.LoaderSupport.WorkerSupport = (function () {

		var WORKER_SUPPORT_VERSION = '2.1.2';

		var Validator = THREE.LoaderSupport.Validator;

		var LoaderWorker = (function () {

			function LoaderWorker( logger ) {
				this.logger = Validator.verifyInput( logger, new THREE.LoaderSupport.ConsoleLogger() );
				this._reset();
			}

			LoaderWorker.prototype._reset = function () {
				this.worker = null;
				this.runnerImplName = null;
				this.callbacks = {
					builder: null,
					onLoad: null
				};
				this.terminateRequested = false;
				this.queuedMessage = null;
				this.started = false;
			};

			LoaderWorker.prototype.initWorker = function ( code, runnerImplName ) {
				this.runnerImplName = runnerImplName;
				var blob = new Blob( [ code ], { type: 'application/javascript' } );
				this.worker = new Worker( window.URL.createObjectURL( blob ) );
				this.worker.onmessage = this._receiveWorkerMessage;

				// set referemce to this, then processing in worker scope within "_receiveWorkerMessage" can access members
				this.worker.runtimeRef = this;

				// process stored queuedMessage
				this._postMessage();
			};

			/**
			 * Executed in worker scope
	 		 */
			LoaderWorker.prototype._receiveWorkerMessage = function ( e ) {
				var payload = e.data;
				switch ( payload.cmd ) {
					case 'meshData':
					case 'materialData':
					case 'imageData':
						this.runtimeRef.callbacks.builder( payload );
						break;

					case 'complete':
						this.runtimeRef.queuedMessage = null;
						this.started = false;
						this.runtimeRef.callbacks.onLoad( payload.msg );

						if ( this.runtimeRef.terminateRequested ) {

							this.runtimeRef.logger.logInfo( 'WorkerSupport [' + this.runtimeRef.runnerImplName + ']: Run is complete. Terminating application on request!' );
							this.runtimeRef._terminate();

						}
						break;

					case 'error':
						this.runtimeRef.logger.logError( 'WorkerSupport [' + this.runtimeRef.runnerImplName + ']: Reported error: ' + payload.msg );
						this.runtimeRef.queuedMessage = null;
						this.started = false;
						this.runtimeRef.callbacks.onLoad( payload.msg );

						if ( this.runtimeRef.terminateRequested ) {

							this.runtimeRef.logger.logInfo( 'WorkerSupport [' + this.runtimeRef.runnerImplName + ']: Run reported error. Terminating application on request!' );
							this.runtimeRef._terminate();

						}
						break;

					default:
						this.runtimeRef.logger.logError( 'WorkerSupport [' + this.runtimeRef.runnerImplName + ']: Received unknown command: ' + payload.cmd );
						break;

				}
			};

			LoaderWorker.prototype.setCallbacks = function ( builder, onLoad ) {
				this.callbacks.builder = Validator.verifyInput( builder, this.callbacks.builder );
				this.callbacks.onLoad = Validator.verifyInput( onLoad, this.callbacks.onLoad );
			};

			LoaderWorker.prototype.run = function( payload ) {
				if ( Validator.isValid( this.queuedMessage ) ) {

					console.warn( 'Already processing message. Rejecting new run instruction' );
					return;

				} else {

					this.queuedMessage = payload;
					this.started = true;

				}
				if ( ! Validator.isValid( this.callbacks.builder ) ) throw 'Unable to run as no "builder" callback is set.';
				if ( ! Validator.isValid( this.callbacks.onLoad ) ) throw 'Unable to run as no "onLoad" callback is set.';
				if ( payload.cmd !== 'run' ) payload.cmd = 'run';
				if ( Validator.isValid( payload.logger ) ) {

					payload.logger.enabled = Validator.verifyInput( payload.logger.enabled, true );
					payload.logger.debug = Validator.verifyInput( payload.logger.debug, false );

				} else {

					payload.logger = {
						enabled: true,
						debug: false
					};

				}
				this._postMessage();
			};

			LoaderWorker.prototype._postMessage = function () {
				if ( Validator.isValid( this.queuedMessage ) && Validator.isValid( this.worker ) ) {

					if ( this.queuedMessage.data.input instanceof ArrayBuffer ) {

						this.worker.postMessage( this.queuedMessage, [ this.queuedMessage.data.input ] );

					} else {

						this.worker.postMessage( this.queuedMessage );

					}

				}
			};

			LoaderWorker.prototype.setTerminateRequested = function ( terminateRequested ) {
				this.terminateRequested = terminateRequested === true;
				if ( this.terminateRequested && Validator.isValid( this.worker ) && ! Validator.isValid( this.queuedMessage ) && this.started ) {

					this.logger.logInfo( 'Worker is terminated immediately as it is not running!' );
					this._terminate();

				}
			};

			LoaderWorker.prototype._terminate = function () {
				this.worker.terminate();
				this._reset();
			};

			return LoaderWorker;

		})();

		function WorkerSupport( logger ) {
			this.logger = Validator.verifyInput( logger, new THREE.LoaderSupport.ConsoleLogger() );
			this.logger.logInfo( 'Using THREE.LoaderSupport.WorkerSupport version: ' + WORKER_SUPPORT_VERSION );

			// check worker support first
			if ( window.Worker === undefined ) throw "This browser does not support web workers!";
			if ( window.Blob === undefined  ) throw "This browser does not support Blob!";
			if ( typeof window.URL.createObjectURL !== 'function'  ) throw "This browser does not support Object creation from URL!";

			this.loaderWorker = new LoaderWorker( this.logger );
		}

		/**
		 * Validate the status of worker code and the derived worker.
		 * @memberOf THREE.LoaderSupport.WorkerSupport
		 *
		 * @param {Function} functionCodeBuilder Function that is invoked with funcBuildObject and funcBuildSingleton that allows stringification of objects and singletons.
		 * @param {String} parserName Name of the Parser object
		 * @param {String[]} libLocations URL of libraries that shall be added to worker code relative to libPath
		 * @param {String} libPath Base path used for loading libraries
		 * @param {THREE.LoaderSupport.WorkerRunnerRefImpl} runnerImpl The default worker parser wrapper implementation (communication and execution). An extended class could be passed here.
		 */
		WorkerSupport.prototype.validate = function ( functionCodeBuilder, parserName, libLocations, libPath, runnerImpl ) {
			if ( Validator.isValid( this.loaderWorker.worker ) ) return;

			this.logger.logInfo( 'WorkerSupport: Building worker code...' );
			this.logger.logTimeStart( 'buildWebWorkerCode' );

			if ( Validator.isValid( runnerImpl ) ) {

				this.logger.logInfo( 'WorkerSupport: Using "' + runnerImpl.name + '" as Runner class for worker.' );

			} else {

				runnerImpl = THREE.LoaderSupport.WorkerRunnerRefImpl;
				this.logger.logInfo( 'WorkerSupport: Using DEFAULT "THREE.LoaderSupport.WorkerRunnerRefImpl" as Runner class for worker.' );

			}

			var userWorkerCode = functionCodeBuilder( buildObject, buildSingleton );
			userWorkerCode += 'var Parser = '+ parserName + ';\n\n';
			userWorkerCode += buildSingleton( runnerImpl.name, runnerImpl );
			userWorkerCode += 'new ' + runnerImpl.name + '();\n\n';

			var scope = this;
			if ( Validator.isValid( libLocations ) && libLocations.length > 0 ) {

				var libsContent = '';
				var loadAllLibraries = function ( path, locations ) {
					if ( locations.length === 0 ) {

						scope.loaderWorker.initWorker( libsContent + userWorkerCode, runnerImpl.name );
						scope.logger.logTimeEnd( 'buildWebWorkerCode' );

					} else {

						var loadedLib = function ( contentAsString ) {
							libsContent += contentAsString;
							loadAllLibraries( path, locations );
						};

						var fileLoader = new THREE.FileLoader();
						fileLoader.setPath( path );
						fileLoader.setResponseType( 'text' );
						fileLoader.load( locations[ 0 ], loadedLib );
						locations.shift();

					}
				};
				loadAllLibraries( libPath, libLocations );

			} else {

				this.loaderWorker.initWorker( userWorkerCode, runnerImpl.name );
				this.logger.logTimeEnd( 'buildWebWorkerCode' );

			}
		};

		/**
		 * Specify functions that should be build when new raw mesh data becomes available and when the parser is finished.
		 * @memberOf THREE.LoaderSupport.WorkerSupport
		 *
		 * @param {Function} builder The builder function. Default is {@link THREE.LoaderSupport.Builder}.
		 * @param {Function} onLoad The function that is called when parsing is complete.
		 */
		WorkerSupport.prototype.setCallbacks = function ( builder, onLoad ) {
			this.loaderWorker.setCallbacks( builder, onLoad );
		};

		/**
		 * Runs the parser with the provided configuration.
		 * @memberOf THREE.LoaderSupport.WorkerSupport
		 *
		 * @param {Object} payload Raw mesh description (buffers, params, materials) used to build one to many meshes.
		 */
		WorkerSupport.prototype.run = function ( payload ) {
			this.loaderWorker.run( payload );
		};

		/**
		 * Request termination of worker once parser is finished.
		 * @memberOf THREE.LoaderSupport.WorkerSupport
		 *
		 * @param {boolean} terminateRequested True or false.
		 */
		WorkerSupport.prototype.setTerminateRequested = function ( terminateRequested ) {
			this.loaderWorker.setTerminateRequested( terminateRequested );
		};

		var buildObject = function ( fullName, object ) {
			var objectString = fullName + ' = {\n';
			var part;
			for ( var name in object ) {

				part = object[ name ];
				if ( typeof( part ) === 'string' || part instanceof String ) {

					part = part.replace( '\n', '\\n' );
					part = part.replace( '\r', '\\r' );
					objectString += '\t' + name + ': "' + part + '",\n';

				} else if ( part instanceof Array ) {

					objectString += '\t' + name + ': [' + part + '],\n';

				} else if ( Number.isInteger( part ) ) {

					objectString += '\t' + name + ': ' + part + ',\n';

				} else if ( typeof part === 'function' ) {

					objectString += '\t' + name + ': ' + part + ',\n';

				}

			}
			objectString += '}\n\n';

			return objectString;
		};

		var buildSingleton = function ( fullName, object, internalName ) {
			var objectString = '';
			var objectName = ( Validator.isValid( internalName ) ) ? internalName : object.name;

			var funcString, objectPart, constructorString;
			for ( var name in object.prototype ) {

				objectPart = object.prototype[ name ];
				if ( name === 'constructor' ) {

					funcString = objectPart.toString();
					funcString = funcString.replace( 'function', '' );
					constructorString = '\tfunction ' + objectName + funcString + ';\n\n';

				} else if ( typeof objectPart === 'function' ) {

					funcString = objectPart.toString();
					objectString += '\t' + objectName + '.prototype.' + name + ' = ' + funcString + ';\n\n';

				}

			}
			objectString += '\treturn ' + objectName + ';\n';
			objectString += '})();\n\n';
			if ( ! Validator.isValid( constructorString ) ) {

				constructorString = fullName + ' = (function () {\n\n';
				constructorString += '\t' + object.prototype.constructor.toString() + '\n\n';
				objectString = constructorString + objectString;

			} else {

				objectString = fullName + ' = (function () {\n\n' + constructorString + objectString;

			}
			return objectString;
		};

		return WorkerSupport;

	})();

	/**
	 * Orchestrate loading of multiple OBJ files/data from an instruction queue with a configurable amount of workers (1-16).
	 * Workflow:
	 *   prepareWorkers
	 *   enqueueForRun
	 *   processQueue
	 *   tearDown (to force stop)
	 *
	 * @class
	 *
	 * @param {string} classDef Class definition to be used for construction
	 * @param {THREE.LoaderSupport.ConsoleLogger} logger logger to be used
	 */
	THREE.LoaderSupport.WorkerDirector = (function () {

		var LOADER_WORKER_DIRECTOR_VERSION = '2.1.0';

		var Validator = THREE.LoaderSupport.Validator;

		var MAX_WEB_WORKER = 16;
		var MAX_QUEUE_SIZE = 8192;

		function WorkerDirector( classDef, logger ) {
			this.logger = Validator.verifyInput( logger, new THREE.LoaderSupport.ConsoleLogger() );
			this.logger.logInfo( 'Using THREE.LoaderSupport.WorkerDirector version: ' + LOADER_WORKER_DIRECTOR_VERSION );

			this.maxQueueSize = MAX_QUEUE_SIZE ;
			this.maxWebWorkers = MAX_WEB_WORKER;
			this.crossOrigin = null;

			if ( ! Validator.isValid( classDef ) ) throw 'Provided invalid classDef: ' + classDef;

			this.workerDescription = {
				classDef: classDef,
				globalCallbacks: {},
				workerSupports: {}
			};
			this.objectsCompleted = 0;
			this.instructionQueue = [];
			this.instructionQueuePointer = 0;

			this.callbackOnFinishedProcessing = null;
		}

		/**
		 * Returns the maximum length of the instruction queue.
		 * @memberOf THREE.LoaderSupport.WorkerDirector
		 *
		 * @returns {number}
		 */
		WorkerDirector.prototype.getMaxQueueSize = function () {
			return this.maxQueueSize;
		};

		/**
		 * Returns the maximum number of workers.
		 * @memberOf THREE.LoaderSupport.WorkerDirector
		 *
		 * @returns {number}
		 */
		WorkerDirector.prototype.getMaxWebWorkers = function () {
			return this.maxWebWorkers;
		};

		/**
		 * Sets the CORS string to be used.
		 * @memberOf THREE.LoaderSupport.WorkerDirector
		 *
		 * @param {string} crossOrigin CORS value
		 */
		WorkerDirector.prototype.setCrossOrigin = function ( crossOrigin ) {
			this.crossOrigin = crossOrigin;
		};

		/**
		 * Create or destroy workers according limits. Set the name and register callbacks for dynamically created web workers.
		 * @memberOf THREE.LoaderSupport.WorkerDirector
		 *
		 * @param {THREE.OBJLoader2.WWOBJLoader2.PrepDataCallbacks} globalCallbacks  Register global callbacks used by all web workers
		 * @param {number} maxQueueSize Set the maximum size of the instruction queue (1-1024)
		 * @param {number} maxWebWorkers Set the maximum amount of workers (1-16)
		 */
		WorkerDirector.prototype.prepareWorkers = function ( globalCallbacks, maxQueueSize, maxWebWorkers ) {
			if ( Validator.isValid( globalCallbacks ) ) this.workerDescription.globalCallbacks = globalCallbacks;
			this.maxQueueSize = Math.min( maxQueueSize, MAX_QUEUE_SIZE );
			this.maxWebWorkers = Math.min( maxWebWorkers, MAX_WEB_WORKER );
			this.maxWebWorkers = Math.min( this.maxWebWorkers, this.maxQueueSize );
			this.objectsCompleted = 0;
			this.instructionQueue = [];
			this.instructionQueuePointer = 0;

			for ( var instanceNo = 0; instanceNo < this.maxWebWorkers; instanceNo++ ) {

				this.workerDescription.workerSupports[ instanceNo ] = {
					instanceNo: instanceNo,
					inUse: false,
					terminateRequested: false,
					workerSupport: new THREE.LoaderSupport.WorkerSupport( this.logger ),
					loader: null
				};

			}
		};

		/**
		 * Store run instructions in internal instructionQueue.
		 * @memberOf THREE.LoaderSupport.WorkerDirector
		 *
		 * @param {THREE.LoaderSupport.PrepData} prepData
		 */
		WorkerDirector.prototype.enqueueForRun = function ( prepData ) {
			if ( this.instructionQueue.length < this.maxQueueSize ) {
				this.instructionQueue.push( prepData );
			}
		};

		/**
		 * Returns if any workers are running.
		 *
		 * @memberOf THREE.LoaderSupport.WorkerDirector
		 * @returns {boolean}
		 */
		WorkerDirector.prototype.isRunning = function () {
			var wsKeys = Object.keys( this.workerDescription.workerSupports );
			return ( ( this.instructionQueue.length > 0 && this.instructionQueuePointer < this.instructionQueue.length ) || wsKeys.length > 0 );
		};

		/**
		 * Process the instructionQueue until it is depleted.
		 * @memberOf THREE.LoaderSupport.WorkerDirector
		 */
		WorkerDirector.prototype.processQueue = function () {
			var prepData, supportDesc;
			for ( var instanceNo in this.workerDescription.workerSupports ) {

				supportDesc = this.workerDescription.workerSupports[ instanceNo ];
				if ( ! supportDesc.inUse ) {

					if ( this.instructionQueuePointer < this.instructionQueue.length ) {

						prepData = this.instructionQueue[ this.instructionQueuePointer ];
						this._kickWorkerRun( prepData, supportDesc );
						this.instructionQueuePointer++;

					} else {

						this._deregister( supportDesc );

					}

				}

			}

			if ( ! this.isRunning() && this.callbackOnFinishedProcessing !== null ) {

				this.callbackOnFinishedProcessing();
				this.callbackOnFinishedProcessing = null;

			}
		};

		WorkerDirector.prototype._kickWorkerRun = function( prepData, supportDesc ) {
			supportDesc.inUse = true;
			supportDesc.workerSupport.setTerminateRequested( supportDesc.terminateRequested );

			this.logger.logInfo( '\nAssigning next item from queue to worker (queue length: ' + this.instructionQueue.length + ')\n\n' );

			var scope = this;
			var prepDataCallbacks = prepData.getCallbacks();
			var globalCallbacks = this.workerDescription.globalCallbacks;
			var wrapperOnLoad = function ( event ) {
				if ( Validator.isValid( globalCallbacks.onLoad ) ) globalCallbacks.onLoad( event );
				if ( Validator.isValid( prepDataCallbacks.onLoad ) ) prepDataCallbacks.onLoad( event );
				scope.objectsCompleted++;
				supportDesc.inUse = false;

				scope.processQueue();
			};

			var wrapperOnProgress = function ( event ) {
				if ( Validator.isValid( globalCallbacks.onProgress ) ) globalCallbacks.onProgress( event );
				if ( Validator.isValid( prepDataCallbacks.onProgress ) ) prepDataCallbacks.onProgress( event );
			};

			var wrapperOnMeshAlter = function ( event ) {
				if ( Validator.isValid( globalCallbacks.onMeshAlter ) ) globalCallbacks.onMeshAlter( event );
				if ( Validator.isValid( prepDataCallbacks.onMeshAlter ) ) prepDataCallbacks.onMeshAlter( event );
			};

			supportDesc.loader = this._buildLoader( supportDesc.instanceNo );

			var updatedCallbacks = new THREE.LoaderSupport.Callbacks();
			updatedCallbacks.setCallbackOnLoad( wrapperOnLoad );
			updatedCallbacks.setCallbackOnProgress( wrapperOnProgress );
			updatedCallbacks.setCallbackOnMeshAlter( wrapperOnMeshAlter );
			prepData.callbacks = updatedCallbacks;

			supportDesc.loader.run( prepData, supportDesc.workerSupport );
		};

		WorkerDirector.prototype._buildLoader = function ( instanceNo ) {
			var classDef = this.workerDescription.classDef;
			var loader = Object.create( classDef.prototype );
			this.workerDescription.classDef.call( loader, THREE.DefaultLoadingManager, this.logger );

			// verify that all required functions are implemented
			if ( ! loader.hasOwnProperty( 'instanceNo' ) ) throw classDef.name + ' has no property "instanceNo".';
			loader.instanceNo = instanceNo;

			if ( ! loader.hasOwnProperty( 'workerSupport' ) ) {

				throw classDef.name + ' has no property "workerSupport".';

			}
			if ( typeof loader.run !== 'function'  ) throw classDef.name + ' has no function "run".';
			if ( ! loader.hasOwnProperty( 'callbacks' ) || ! Validator.isValid( loader.callbacks ) ) {

				this.logger.logWarn( classDef.name + ' has an invalid property "callbacks". Will change to "THREE.LoaderSupport.Callbacks"' );
				loader.callbacks = new THREE.LoaderSupport.Callbacks();

			}
			return loader;
		};

		WorkerDirector.prototype._deregister = function ( supportDesc ) {
			if ( Validator.isValid( supportDesc ) ) {

				supportDesc.workerSupport.setTerminateRequested( true );
				this.logger.logInfo( 'Requested termination of worker #' + supportDesc.instanceNo + '.' );

				var loaderCallbacks = supportDesc.loader.callbacks;
				if ( Validator.isValid( loaderCallbacks.onProgress ) ) loaderCallbacks.onProgress( { detail: { text: '' } } );
				delete this.workerDescription.workerSupports[ supportDesc.instanceNo ];

			}
		};

		/**
		 * Terminate all workers.
		 * @memberOf THREE.LoaderSupport.WorkerDirector
		 *
		 * @param {callback} callbackOnFinishedProcessing Function called once all workers finished processing.
		 */
		WorkerDirector.prototype.tearDown = function ( callbackOnFinishedProcessing ) {
			this.logger.logInfo( 'WorkerDirector received the deregister call. Terminating all workers!' );

			this.instructionQueuePointer = this.instructionQueue.length;
			this.callbackOnFinishedProcessing = Validator.verifyInput( callbackOnFinishedProcessing, null );

			for ( var name in this.workerDescription.workerSupports ) {

				this.workerDescription.workerSupports[ name ].terminateRequested = true;

			}
		};

		return WorkerDirector;

	})();

	/*
	 * @author Daosheng Mu / https://github.com/DaoshengMu/
	 * @author mrdoob / http://mrdoob.com/
	 * @author takahirox / https://github.com/takahirox/
	 */

	THREE.TGALoader = function ( manager ) {

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	};

	THREE.TGALoader.prototype = {

		constructor: THREE.TGALoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var texture = new THREE.Texture();

			var loader = new THREE.FileLoader( this.manager );
			loader.setResponseType( 'arraybuffer' );

			loader.load( url, function ( buffer ) {

				texture.image = scope.parse( buffer );
				texture.needsUpdate = true;

				if ( onLoad !== undefined ) {

					onLoad( texture );

				}

			}, onProgress, onError );

			return texture;

		},

		parse: function ( buffer ) {

			// reference from vthibault, https://github.com/vthibault/roBrowser/blob/master/src/Loaders/Targa.js

			function tgaCheckHeader( header ) {

				switch ( header.image_type ) {

					// check indexed type

					case TGA_TYPE_INDEXED:
					case TGA_TYPE_RLE_INDEXED:
						if ( header.colormap_length > 256 || header.colormap_size !== 24 || header.colormap_type !== 1 ) {

							console.error( 'THREE.TGALoader: Invalid type colormap data for indexed type.' );

						}
						break;

					// check colormap type

					case TGA_TYPE_RGB:
					case TGA_TYPE_GREY:
					case TGA_TYPE_RLE_RGB:
					case TGA_TYPE_RLE_GREY:
						if ( header.colormap_type ) {

							console.error( 'THREE.TGALoader: Invalid type colormap data for colormap type.' );

						}
						break;

					// What the need of a file without data ?

					case TGA_TYPE_NO_DATA:
						console.error( 'THREE.TGALoader: No data.' );

					// Invalid type ?

					default:
						console.error( 'THREE.TGALoader: Invalid type "%s".', header.image_type );

				}

				// check image width and height

				if ( header.width <= 0 || header.height <= 0 ) {

					console.error( 'THREE.TGALoader: Invalid image size.' );

				}

				// check image pixel size

				if ( header.pixel_size !== 8 && header.pixel_size !== 16 &&
					header.pixel_size !== 24 && header.pixel_size !== 32 ) {

					console.error( 'THREE.TGALoader: Invalid pixel size "%s".', header.pixel_size );

				}

			}

			// parse tga image buffer

			function tgaParse( use_rle, use_pal, header, offset, data ) {

				var pixel_data,
					pixel_size,
					pixel_total,
					palettes;

				pixel_size = header.pixel_size >> 3;
				pixel_total = header.width * header.height * pixel_size;

				 // read palettes

				 if ( use_pal ) {

					 palettes = data.subarray( offset, offset += header.colormap_length * ( header.colormap_size >> 3 ) );

				 }

				 // read RLE

				 if ( use_rle ) {

					 pixel_data = new Uint8Array( pixel_total );

					var c, count, i;
					var shift = 0;
					var pixels = new Uint8Array( pixel_size );

					while ( shift < pixel_total ) {

						c = data[ offset ++ ];
						count = ( c & 0x7f ) + 1;

						// RLE pixels

						if ( c & 0x80 ) {

							// bind pixel tmp array

							for ( i = 0; i < pixel_size; ++ i ) {

								pixels[ i ] = data[ offset ++ ];

							}

							// copy pixel array

							for ( i = 0; i < count; ++ i ) {

								pixel_data.set( pixels, shift + i * pixel_size );

							}

							shift += pixel_size * count;

						} else {

							// raw pixels

							count *= pixel_size;
							for ( i = 0; i < count; ++ i ) {

								pixel_data[ shift + i ] = data[ offset ++ ];

							}
							shift += count;

						}

					}

				 } else {

					// raw pixels

					pixel_data = data.subarray(
						 offset, offset += ( use_pal ? header.width * header.height : pixel_total )
					);

				 }

				 return {
					pixel_data: pixel_data,
					palettes: palettes
				 };

			}

			function tgaGetImageData8bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image, palettes ) {

				var colormap = palettes;
				var color, i = 0, x, y;
				var width = header.width;

				for ( y = y_start; y !== y_end; y += y_step ) {

					for ( x = x_start; x !== x_end; x += x_step, i ++ ) {

						color = image[ i ];
						imageData[ ( x + width * y ) * 4 + 3 ] = 255;
						imageData[ ( x + width * y ) * 4 + 2 ] = colormap[ ( color * 3 ) + 0 ];
						imageData[ ( x + width * y ) * 4 + 1 ] = colormap[ ( color * 3 ) + 1 ];
						imageData[ ( x + width * y ) * 4 + 0 ] = colormap[ ( color * 3 ) + 2 ];

					}

				}

				return imageData;

			}

			function tgaGetImageData16bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

				var color, i = 0, x, y;
				var width = header.width;

				for ( y = y_start; y !== y_end; y += y_step ) {

					for ( x = x_start; x !== x_end; x += x_step, i += 2 ) {

						color = image[ i + 0 ] + ( image[ i + 1 ] << 8 ); // Inversed ?
						imageData[ ( x + width * y ) * 4 + 0 ] = ( color & 0x7C00 ) >> 7;
						imageData[ ( x + width * y ) * 4 + 1 ] = ( color & 0x03E0 ) >> 2;
						imageData[ ( x + width * y ) * 4 + 2 ] = ( color & 0x001F ) >> 3;
						imageData[ ( x + width * y ) * 4 + 3 ] = ( color & 0x8000 ) ? 0 : 255;

					}

				}

				return imageData;

			}

			function tgaGetImageData24bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

				var i = 0, x, y;
				var width = header.width;

				for ( y = y_start; y !== y_end; y += y_step ) {

					for ( x = x_start; x !== x_end; x += x_step, i += 3 ) {

						imageData[ ( x + width * y ) * 4 + 3 ] = 255;
						imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
						imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 1 ];
						imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 2 ];

					}

				}

				return imageData;

			}

			function tgaGetImageData32bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

				var i = 0, x, y;
				var width = header.width;

				for ( y = y_start; y !== y_end; y += y_step ) {

					for ( x = x_start; x !== x_end; x += x_step, i += 4 ) {

						imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
						imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 1 ];
						imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 2 ];
						imageData[ ( x + width * y ) * 4 + 3 ] = image[ i + 3 ];

					}

				}

				return imageData;

			}

			function tgaGetImageDataGrey8bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

				var color, i = 0, x, y;
				var width = header.width;

				for ( y = y_start; y !== y_end; y += y_step ) {

					for ( x = x_start; x !== x_end; x += x_step, i ++ ) {

						color = image[ i ];
						imageData[ ( x + width * y ) * 4 + 0 ] = color;
						imageData[ ( x + width * y ) * 4 + 1 ] = color;
						imageData[ ( x + width * y ) * 4 + 2 ] = color;
						imageData[ ( x + width * y ) * 4 + 3 ] = 255;

					}

				}

				return imageData;

			}

			function tgaGetImageDataGrey16bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

				var i = 0, x, y;
				var width = header.width;

				for ( y = y_start; y !== y_end; y += y_step ) {

					for ( x = x_start; x !== x_end; x += x_step, i += 2 ) {

						imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 0 ];
						imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 0 ];
						imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
						imageData[ ( x + width * y ) * 4 + 3 ] = image[ i + 1 ];

					}

				}

				return imageData;

			}

			function getTgaRGBA( data, width, height, image, palette ) {

				var x_start,
					y_start,
					x_step,
					y_step,
					x_end,
					y_end;

				switch ( ( header.flags & TGA_ORIGIN_MASK ) >> TGA_ORIGIN_SHIFT ) {

					default:
					case TGA_ORIGIN_UL:
						x_start = 0;
						x_step = 1;
						x_end = width;
						y_start = 0;
						y_step = 1;
						y_end = height;
						break;

					case TGA_ORIGIN_BL:
						x_start = 0;
						x_step = 1;
						x_end = width;
						y_start = height - 1;
						y_step = - 1;
						y_end = - 1;
						break;

					case TGA_ORIGIN_UR:
						x_start = width - 1;
						x_step = - 1;
						x_end = - 1;
						y_start = 0;
						y_step = 1;
						y_end = height;
						break;

					case TGA_ORIGIN_BR:
						x_start = width - 1;
						x_step = - 1;
						x_end = - 1;
						y_start = height - 1;
						y_step = - 1;
						y_end = - 1;
						break;

				}

				if ( use_grey ) {

					switch ( header.pixel_size ) {

						case 8:
							tgaGetImageDataGrey8bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
							break;

						case 16:
							tgaGetImageDataGrey16bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
							break;

						default:
							console.error( 'THREE.TGALoader: Format not supported.' );
							break;

					}

				} else {

					switch ( header.pixel_size ) {

						case 8:
							tgaGetImageData8bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image, palette );
							break;

						case 16:
							tgaGetImageData16bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
							break;

						case 24:
							tgaGetImageData24bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
							break;

						case 32:
							tgaGetImageData32bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
							break;

						default:
							console.error( 'THREE.TGALoader: Format not supported.' );
							break;

					}

				}

				// Load image data according to specific method
				// var func = 'tgaGetImageData' + (use_grey ? 'Grey' : '') + (header.pixel_size) + 'bits';
				// func(data, y_start, y_step, y_end, x_start, x_step, x_end, width, image, palette );
				return data;

			}

			// TGA constants

			var TGA_TYPE_NO_DATA = 0,
				TGA_TYPE_INDEXED = 1,
				TGA_TYPE_RGB = 2,
				TGA_TYPE_GREY = 3,
				TGA_TYPE_RLE_INDEXED = 9,
				TGA_TYPE_RLE_RGB = 10,
				TGA_TYPE_RLE_GREY = 11,

				TGA_ORIGIN_MASK = 0x30,
				TGA_ORIGIN_SHIFT = 0x04,
				TGA_ORIGIN_BL = 0x00,
				TGA_ORIGIN_BR = 0x01,
				TGA_ORIGIN_UL = 0x02,
				TGA_ORIGIN_UR = 0x03;

			if ( buffer.length < 19 ) console.error( 'THREE.TGALoader: Not enough data to contain header.' );

			var content = new Uint8Array( buffer ),
				offset = 0,
				header = {
					id_length: content[ offset ++ ],
					colormap_type: content[ offset ++ ],
					image_type: content[ offset ++ ],
					colormap_index: content[ offset ++ ] | content[ offset ++ ] << 8,
					colormap_length: content[ offset ++ ] | content[ offset ++ ] << 8,
					colormap_size: content[ offset ++ ],
					origin: [
						content[ offset ++ ] | content[ offset ++ ] << 8,
						content[ offset ++ ] | content[ offset ++ ] << 8
					],
					width: content[ offset ++ ] | content[ offset ++ ] << 8,
					height: content[ offset ++ ] | content[ offset ++ ] << 8,
					pixel_size: content[ offset ++ ],
					flags: content[ offset ++ ]
				};

				// check tga if it is valid format

			tgaCheckHeader( header );

			if ( header.id_length + offset > buffer.length ) {

				console.error( 'THREE.TGALoader: No data.' );

			}

			// skip the needn't data

			offset += header.id_length;

			// get targa information about RLE compression and palette

			var use_rle = false,
				use_pal = false,
				use_grey = false;

			switch ( header.image_type ) {

				case TGA_TYPE_RLE_INDEXED:
					use_rle = true;
					use_pal = true;
					break;

				case TGA_TYPE_INDEXED:
					use_pal = true;
					break;

				case TGA_TYPE_RLE_RGB:
					use_rle = true;
					break;

				case TGA_TYPE_RGB:
					break;

				case TGA_TYPE_RLE_GREY:
					use_rle = true;
					use_grey = true;
					break;

				case TGA_TYPE_GREY:
					use_grey = true;
					break;

			}

			//

			var canvas = document.createElement( 'canvas' );
			canvas.width = header.width;
			canvas.height = header.height;

			var context = canvas.getContext( '2d' );
			var imageData = context.createImageData( header.width, header.height );

			var result = tgaParse( use_rle, use_pal, header, offset, content );
			var rgbaData = getTgaRGBA( imageData.data, header.width, header.height, result.pixel_data, result.palettes );

			context.putImageData( imageData, 0, 0 );

			return canvas;

		}

	};

	/*
	 * @author mrdoob / http://mrdoob.com/
	 */

	THREE.DDSLoader = function () {

		this._parser = THREE.DDSLoader.parse;

	};

	THREE.DDSLoader.prototype = Object.create( THREE.CompressedTextureLoader.prototype );
	THREE.DDSLoader.prototype.constructor = THREE.DDSLoader;

	THREE.DDSLoader.parse = function ( buffer, loadMipmaps ) {

		var dds = { mipmaps: [], width: 0, height: 0, format: null, mipmapCount: 1 };

		// Adapted from @toji's DDS utils
		// https://github.com/toji/webgl-texture-utils/blob/master/texture-util/dds.js

		// All values and structures referenced from:
		// http://msdn.microsoft.com/en-us/library/bb943991.aspx/

		var DDS_MAGIC = 0x20534444;

		var DDSD_MIPMAPCOUNT = 0x20000;

		var DDSCAPS2_CUBEMAP = 0x200,
			DDSCAPS2_CUBEMAP_POSITIVEX = 0x400,
			DDSCAPS2_CUBEMAP_NEGATIVEX = 0x800,
			DDSCAPS2_CUBEMAP_POSITIVEY = 0x1000,
			DDSCAPS2_CUBEMAP_NEGATIVEY = 0x2000,
			DDSCAPS2_CUBEMAP_POSITIVEZ = 0x4000,
			DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x8000;

		var DDPF_FOURCC = 0x4;

		function fourCCToInt32( value ) {

			return value.charCodeAt( 0 ) +
				( value.charCodeAt( 1 ) << 8 ) +
				( value.charCodeAt( 2 ) << 16 ) +
				( value.charCodeAt( 3 ) << 24 );

		}

		function int32ToFourCC( value ) {

			return String.fromCharCode(
				value & 0xff,
				( value >> 8 ) & 0xff,
				( value >> 16 ) & 0xff,
				( value >> 24 ) & 0xff
			);

		}

		function loadARGBMip( buffer, dataOffset, width, height ) {

			var dataLength = width * height * 4;
			var srcBuffer = new Uint8Array( buffer, dataOffset, dataLength );
			var byteArray = new Uint8Array( dataLength );
			var dst = 0;
			var src = 0;
			for ( var y = 0; y < height; y ++ ) {

				for ( var x = 0; x < width; x ++ ) {

					var b = srcBuffer[ src ]; src ++;
					var g = srcBuffer[ src ]; src ++;
					var r = srcBuffer[ src ]; src ++;
					var a = srcBuffer[ src ]; src ++;
					byteArray[ dst ] = r; dst ++;	//r
					byteArray[ dst ] = g; dst ++;	//g
					byteArray[ dst ] = b; dst ++;	//b
					byteArray[ dst ] = a; dst ++;	//a

				}

			}
			return byteArray;

		}

		var FOURCC_DXT1 = fourCCToInt32( "DXT1" );
		var FOURCC_DXT3 = fourCCToInt32( "DXT3" );
		var FOURCC_DXT5 = fourCCToInt32( "DXT5" );
		var FOURCC_ETC1 = fourCCToInt32( "ETC1" );

		var headerLengthInt = 31; // The header length in 32 bit ints

		// Offsets into the header array

		var off_magic = 0;

		var off_size = 1;
		var off_flags = 2;
		var off_height = 3;
		var off_width = 4;

		var off_mipmapCount = 7;

		var off_pfFlags = 20;
		var off_pfFourCC = 21;
		var off_RGBBitCount = 22;
		var off_RBitMask = 23;
		var off_GBitMask = 24;
		var off_BBitMask = 25;
		var off_ABitMask = 26;
		var off_caps2 = 28;

		// Parse header

		var header = new Int32Array( buffer, 0, headerLengthInt );

		if ( header[ off_magic ] !== DDS_MAGIC ) {

			console.error( 'THREE.DDSLoader.parse: Invalid magic number in DDS header.' );
			return dds;

		}

		if ( ! header[ off_pfFlags ] & DDPF_FOURCC ) {

			console.error( 'THREE.DDSLoader.parse: Unsupported format, must contain a FourCC code.' );
			return dds;

		}

		var blockBytes;

		var fourCC = header[ off_pfFourCC ];

		var isRGBAUncompressed = false;

		switch ( fourCC ) {

			case FOURCC_DXT1:

				blockBytes = 8;
				dds.format = THREE.RGB_S3TC_DXT1_Format;
				break;

			case FOURCC_DXT3:

				blockBytes = 16;
				dds.format = THREE.RGBA_S3TC_DXT3_Format;
				break;

			case FOURCC_DXT5:

				blockBytes = 16;
				dds.format = THREE.RGBA_S3TC_DXT5_Format;
				break;

			case FOURCC_ETC1:

				blockBytes = 8;
				dds.format = THREE.RGB_ETC1_Format;
				break;

			default:

				if ( header[ off_RGBBitCount ] === 32
					&& header[ off_RBitMask ] & 0xff0000
					&& header[ off_GBitMask ] & 0xff00
					&& header[ off_BBitMask ] & 0xff
					&& header[ off_ABitMask ] & 0xff000000 ) {

					isRGBAUncompressed = true;
					blockBytes = 64;
					dds.format = THREE.RGBAFormat;

				} else {

					console.error( 'THREE.DDSLoader.parse: Unsupported FourCC code ', int32ToFourCC( fourCC ) );
					return dds;

				}

		}

		dds.mipmapCount = 1;

		if ( header[ off_flags ] & DDSD_MIPMAPCOUNT && loadMipmaps !== false ) {

			dds.mipmapCount = Math.max( 1, header[ off_mipmapCount ] );

		}

		var caps2 = header[ off_caps2 ];
		dds.isCubemap = caps2 & DDSCAPS2_CUBEMAP ? true : false;
		if ( dds.isCubemap && (
			! ( caps2 & DDSCAPS2_CUBEMAP_POSITIVEX ) ||
			! ( caps2 & DDSCAPS2_CUBEMAP_NEGATIVEX ) ||
			! ( caps2 & DDSCAPS2_CUBEMAP_POSITIVEY ) ||
			! ( caps2 & DDSCAPS2_CUBEMAP_NEGATIVEY ) ||
			! ( caps2 & DDSCAPS2_CUBEMAP_POSITIVEZ ) ||
			! ( caps2 & DDSCAPS2_CUBEMAP_NEGATIVEZ )
		) ) {

			console.error( 'THREE.DDSLoader.parse: Incomplete cubemap faces' );
			return dds;

		}

		dds.width = header[ off_width ];
		dds.height = header[ off_height ];

		var dataOffset = header[ off_size ] + 4;

		// Extract mipmaps buffers

		var faces = dds.isCubemap ? 6 : 1;

		for ( var face = 0; face < faces; face ++ ) {

			var width = dds.width;
			var height = dds.height;

			for ( var i = 0; i < dds.mipmapCount; i ++ ) {

				if ( isRGBAUncompressed ) {

					var byteArray = loadARGBMip( buffer, dataOffset, width, height );
					var dataLength = byteArray.length;

				} else {

					var dataLength = Math.max( 4, width ) / 4 * Math.max( 4, height ) / 4 * blockBytes;
					var byteArray = new Uint8Array( buffer, dataOffset, dataLength );

				}

				var mipmap = { "data": byteArray, "width": width, "height": height };
				dds.mipmaps.push( mipmap );

				dataOffset += dataLength;

				width = Math.max( width >> 1, 1 );
				height = Math.max( height >> 1, 1 );

			}

		}

		return dds;

	};

	/**
	 * Loads a Wavefront .mtl file specifying materials
	 *
	 * @author angelxuanchang
	 */

	THREE.MTLLoader = function ( manager ) {

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	};

	THREE.MTLLoader.prototype = {

		constructor: THREE.MTLLoader,

		/**
		 * Loads and parses a MTL asset from a URL.
		 *
		 * @param {String} url - URL to the MTL file.
		 * @param {Function} [onLoad] - Callback invoked with the loaded object.
		 * @param {Function} [onProgress] - Callback for download progress.
		 * @param {Function} [onError] - Callback for download errors.
		 *
		 * @see setPath setTexturePath
		 *
		 * @note In order for relative texture references to resolve correctly
		 * you must call setPath and/or setTexturePath explicitly prior to load.
		 */
		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var loader = new THREE.FileLoader( this.manager );
			loader.setPath( this.path );
			loader.load( url, function ( text ) {

				onLoad( scope.parse( text ) );

			}, onProgress, onError );

		},

		/**
		 * Set base path for resolving references.
		 * If set this path will be prepended to each loaded and found reference.
		 *
		 * @see setTexturePath
		 * @param {String} path
		 *
		 * @example
		 *     mtlLoader.setPath( 'assets/obj/' );
		 *     mtlLoader.load( 'my.mtl', ... );
		 */
		setPath: function ( path ) {

			this.path = path;

		},

		/**
		 * Set base path for resolving texture references.
		 * If set this path will be prepended found texture reference.
		 * If not set and setPath is, it will be used as texture base path.
		 *
		 * @see setPath
		 * @param {String} path
		 *
		 * @example
		 *     mtlLoader.setPath( 'assets/obj/' );
		 *     mtlLoader.setTexturePath( 'assets/textures/' );
		 *     mtlLoader.load( 'my.mtl', ... );
		 */
		setTexturePath: function ( path ) {

			this.texturePath = path;

		},

		setBaseUrl: function ( path ) {

			console.warn( 'THREE.MTLLoader: .setBaseUrl() is deprecated. Use .setTexturePath( path ) for texture path or .setPath( path ) for general base path instead.' );

			this.setTexturePath( path );

		},

		setCrossOrigin: function ( value ) {

			this.crossOrigin = value;

		},

		setMaterialOptions: function ( value ) {

			this.materialOptions = value;

		},

		/**
		 * Parses a MTL file.
		 *
		 * @param {String} text - Content of MTL file
		 * @return {THREE.MTLLoader.MaterialCreator}
		 *
		 * @see setPath setTexturePath
		 *
		 * @note In order for relative texture references to resolve correctly
		 * you must call setPath and/or setTexturePath explicitly prior to parse.
		 */
		parse: function ( text ) {

			var lines = text.split( '\n' );
			var info = {};
			var delimiter_pattern = /\s+/;
			var materialsInfo = {};

			for ( var i = 0; i < lines.length; i ++ ) {

				var line = lines[ i ];
				line = line.trim();

				if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

					// Blank line or comment ignore
					continue;

				}

				var pos = line.indexOf( ' ' );

				var key = ( pos >= 0 ) ? line.substring( 0, pos ) : line;
				key = key.toLowerCase();

				var value = ( pos >= 0 ) ? line.substring( pos + 1 ) : '';
				value = value.trim();

				if ( key === 'newmtl' ) {

					// New material

					info = { name: value };
					materialsInfo[ value ] = info;

				} else if ( info ) {

					if ( key === 'ka' || key === 'kd' || key === 'ks' ) {

						var ss = value.split( delimiter_pattern, 3 );
						info[ key ] = [ parseFloat( ss[ 0 ] ), parseFloat( ss[ 1 ] ), parseFloat( ss[ 2 ] ) ];

					} else {

						info[ key ] = value;

					}

				}

			}

			var materialCreator = new THREE.MTLLoader.MaterialCreator( this.texturePath || this.path, this.materialOptions );
			materialCreator.setCrossOrigin( this.crossOrigin );
			materialCreator.setManager( this.manager );
			materialCreator.setMaterials( materialsInfo );
			return materialCreator;

		}

	};

	/**
	 * Create a new THREE-MTLLoader.MaterialCreator
	 * @param baseUrl - Url relative to which textures are loaded
	 * @param options - Set of options on how to construct the materials
	 *                  side: Which side to apply the material
	 *                        THREE.FrontSide (default), THREE.BackSide, THREE.DoubleSide
	 *                  wrap: What type of wrapping to apply for textures
	 *                        THREE.RepeatWrapping (default), THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping
	 *                  normalizeRGB: RGBs need to be normalized to 0-1 from 0-255
	 *                                Default: false, assumed to be already normalized
	 *                  ignoreZeroRGBs: Ignore values of RGBs (Ka,Kd,Ks) that are all 0's
	 *                                  Default: false
	 * @constructor
	 */

	THREE.MTLLoader.MaterialCreator = function ( baseUrl, options ) {

		this.baseUrl = baseUrl || '';
		this.options = options;
		this.materialsInfo = {};
		this.materials = {};
		this.materialsArray = [];
		this.nameLookup = {};

		this.side = ( this.options && this.options.side ) ? this.options.side : THREE.FrontSide;
		this.wrap = ( this.options && this.options.wrap ) ? this.options.wrap : THREE.RepeatWrapping;

	};

	THREE.MTLLoader.MaterialCreator.prototype = {

		constructor: THREE.MTLLoader.MaterialCreator,

		crossOrigin: 'Anonymous',

		setCrossOrigin: function ( value ) {

			this.crossOrigin = value;

		},

		setManager: function ( value ) {

			this.manager = value;

		},

		setMaterials: function ( materialsInfo ) {

			this.materialsInfo = this.convert( materialsInfo );
			this.materials = {};
			this.materialsArray = [];
			this.nameLookup = {};

		},

		convert: function ( materialsInfo ) {

			if ( ! this.options ) return materialsInfo;

			var converted = {};

			for ( var mn in materialsInfo ) {

				// Convert materials info into normalized form based on options

				var mat = materialsInfo[ mn ];

				var covmat = {};

				converted[ mn ] = covmat;

				for ( var prop in mat ) {

					var save = true;
					var value = mat[ prop ];
					var lprop = prop.toLowerCase();

					switch ( lprop ) {

						case 'kd':
						case 'ka':
						case 'ks':

							// Diffuse color (color under white light) using RGB values

							if ( this.options && this.options.normalizeRGB ) {

								value = [ value[ 0 ] / 255, value[ 1 ] / 255, value[ 2 ] / 255 ];

							}

							if ( this.options && this.options.ignoreZeroRGBs ) {

								if ( value[ 0 ] === 0 && value[ 1 ] === 0 && value[ 2 ] === 0 ) {

									// ignore

									save = false;

								}

							}

							break;

						default:

							break;

					}

					if ( save ) {

						covmat[ lprop ] = value;

					}

				}

			}

			return converted;

		},

		preload: function () {

			for ( var mn in this.materialsInfo ) {

				this.create( mn );

			}

		},

		getIndex: function ( materialName ) {

			return this.nameLookup[ materialName ];

		},

		getAsArray: function () {

			var index = 0;

			for ( var mn in this.materialsInfo ) {

				this.materialsArray[ index ] = this.create( mn );
				this.nameLookup[ mn ] = index;
				index ++;

			}

			return this.materialsArray;

		},

		create: function ( materialName ) {

			if ( this.materials[ materialName ] === undefined ) {

				this.createMaterial_( materialName );

			}

			return this.materials[ materialName ];

		},

		createMaterial_: function ( materialName ) {

			// Create material

			var scope = this;
			var mat = this.materialsInfo[ materialName ];
			var params = {

				name: materialName,
				side: this.side

			};

			function resolveURL( baseUrl, url ) {

				if ( typeof url !== 'string' || url === '' )
					return '';

				// Absolute URL
				if ( /^https?:\/\//i.test( url ) ) return url;

				return baseUrl + url;

			}

			function setMapForType( mapType, value ) {

				if ( params[ mapType ] ) return; // Keep the first encountered texture

				var texParams = scope.getTextureParams( value, params );
				var map = scope.loadTexture( resolveURL( scope.baseUrl, texParams.url ) );

				map.repeat.copy( texParams.scale );
				map.offset.copy( texParams.offset );

				map.wrapS = scope.wrap;
				map.wrapT = scope.wrap;

				params[ mapType ] = map;

			}

			for ( var prop in mat ) {

				var value = mat[ prop ];
				var n;

				if ( value === '' ) continue;

				switch ( prop.toLowerCase() ) {

					// Ns is material specular exponent

					case 'kd':

						// Diffuse color (color under white light) using RGB values

						params.color = new THREE.Color().fromArray( value );

						break;

					case 'ks':

						// Specular color (color when light is reflected from shiny surface) using RGB values
						params.specular = new THREE.Color().fromArray( value );

						break;

					case 'map_kd':

						// Diffuse texture map

						setMapForType( "map", value );

						break;

					case 'map_ks':

						// Specular map

						setMapForType( "specularMap", value );

						break;

					case 'norm':

						setMapForType( "normalMap", value );

						break;

					case 'map_bump':
					case 'bump':

						// Bump texture map

						setMapForType( "bumpMap", value );

						break;

					case 'ns':

						// The specular exponent (defines the focus of the specular highlight)
						// A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.

						params.shininess = parseFloat( value );

						break;

					case 'd':
						n = parseFloat( value );

						if ( n < 1 ) {

							params.opacity = n;
							params.transparent = true;

						}

						break;

					case 'tr':
						n = parseFloat( value );

						if ( this.options && this.options.invertTrProperty ) n = 1 - n;

						if ( n < 1 ) {

							params.opacity = n;
							params.transparent = true;

						}

						break;

					default:
						break;

				}

			}

			this.materials[ materialName ] = new THREE.MeshPhongMaterial( params );
			return this.materials[ materialName ];

		},

		getTextureParams: function ( value, matParams ) {

			var texParams = {

				scale: new THREE.Vector2( 1, 1 ),
				offset: new THREE.Vector2( 0, 0 )

			 };

			var items = value.split( /\s+/ );
			var pos;

			pos = items.indexOf( '-bm' );

			if ( pos >= 0 ) {

				matParams.bumpScale = parseFloat( items[ pos + 1 ] );
				items.splice( pos, 2 );

			}

			pos = items.indexOf( '-s' );

			if ( pos >= 0 ) {

				texParams.scale.set( parseFloat( items[ pos + 1 ] ), parseFloat( items[ pos + 2 ] ) );
				items.splice( pos, 4 ); // we expect 3 parameters here!

			}

			pos = items.indexOf( '-o' );

			if ( pos >= 0 ) {

				texParams.offset.set( parseFloat( items[ pos + 1 ] ), parseFloat( items[ pos + 2 ] ) );
				items.splice( pos, 4 ); // we expect 3 parameters here!

			}

			texParams.url = items.join( ' ' ).trim();
			return texParams;

		},

		loadTexture: function ( url, mapping, onLoad, onProgress, onError ) {

			var texture;
			var loader = THREE.Loader.Handlers.get( url );
			var manager = ( this.manager !== undefined ) ? this.manager : THREE.DefaultLoadingManager;

			if ( loader === null ) {

				loader = new THREE.TextureLoader( manager );

			}

			if ( loader.setCrossOrigin ) loader.setCrossOrigin( this.crossOrigin );
			texture = loader.load( url, onLoad, onProgress, onError );

			if ( mapping !== undefined ) texture.mapping = mapping;

			return texture;

		}

	};

	/**
	  * @author Kai Salmen / https://kaisalmen.de
	  * Development repository: https://github.com/kaisalmen/WWOBJLoader
	  */

	if ( THREE.OBJLoader2 === undefined ) { THREE.OBJLoader2 = {}; }

	if ( THREE.LoaderSupport === undefined ) console.error( '"THREE.LoaderSupport" is not available. "THREE.OBJLoader2" requires it. Please include "LoaderSupport.js" in your HTML.' );

	/**
	 * Use this class to load OBJ data from files or to parse OBJ data from an arraybuffer
	 * @class
	 *
	 * @param {THREE.DefaultLoadingManager} [manager] The loadingManager for the loader to use. Default is {@link THREE.DefaultLoadingManager}
	 * @param {THREE.LoaderSupport.ConsoleLogger} logger logger to be used
	 */
	THREE.OBJLoader2 = (function () {

		var OBJLOADER2_VERSION = '2.3.1';
		var Validator = THREE.LoaderSupport.Validator;

		OBJLoader2.prototype = Object.create( THREE.LoaderSupport.LoaderBase.prototype );
		OBJLoader2.prototype.constructor = OBJLoader2;

		function OBJLoader2( manager, logger ) {
			THREE.LoaderSupport.LoaderBase.call( this, manager, logger );
			this.logger.logInfo( 'Using THREE.OBJLoader2 version: ' + OBJLOADER2_VERSION );

			this.materialPerSmoothingGroup = false;

			this.workerSupport = null;
			this.terminateWorkerOnLoad = true;
		}

		/**
		 * Tells whether a material shall be created per smoothing group.
		 * @memberOf THREE.OBJLoader2
		 *
		 * @param {boolean} materialPerSmoothingGroup=false
		 */
		OBJLoader2.prototype.setMaterialPerSmoothingGroup = function ( materialPerSmoothingGroup ) {
			this.materialPerSmoothingGroup = materialPerSmoothingGroup === true;
		};

		/**
		 * Run the loader according the provided instructions.
		 * @memberOf THREE.OBJLoader2
		 *
		 * @param {THREE.LoaderSupport.PrepData} prepData All parameters and resources required for execution
		 * @param {THREE.LoaderSupport.WorkerSupport} [workerSupportExternal] Use pre-existing WorkerSupport
		 */
		OBJLoader2.prototype.run = function ( prepData, workerSupportExternal ) {
			this._applyPrepData( prepData );
			var available = this.checkResourceDescriptorFiles( prepData.resources,
				[
					{ ext: "obj", type: "Uint8Array", ignore: false },
					{ ext: "mtl", type: "String", ignore: false },
					{ ext: "zip", type: "String", ignore: true }
				]
			);
			if ( Validator.isValid( workerSupportExternal ) ) {

				this.terminateWorkerOnLoad = false;
				this.workerSupport = workerSupportExternal;
				this.logger = workerSupportExternal.logger;

			}
			var scope = this;
			var onMaterialsLoaded = function ( materials ) {
				scope.builder.setMaterials( materials );

				if ( Validator.isValid( available.obj.content ) ) {

					if ( prepData.useAsync ) {

						scope.parseAsync( available.obj.content, scope.callbacks.onLoad );

					} else {

						scope.parse( available.obj.content );

					}
				} else {

					scope.setPath( available.obj.path );
					scope.load( available.obj.name, scope.callbacks.onLoad, null, null, scope.callbacks.onMeshAlter, prepData.useAsync );

				}
			};

			this._loadMtl( available.mtl, onMaterialsLoaded, prepData.crossOrigin );
		};

		OBJLoader2.prototype._applyPrepData = function ( prepData ) {
			THREE.LoaderSupport.LoaderBase.prototype._applyPrepData.call( this, prepData );

			if ( Validator.isValid( prepData ) ) {

				this.setMaterialPerSmoothingGroup( prepData.materialPerSmoothingGroup );

			}
		};

		/**
		 * Parses OBJ data synchronously from arraybuffer or string.
		 * @memberOf THREE.OBJLoader2
		 *
		 * @param {arraybuffer|string} content OBJ data as Uint8Array or String
		 */
		OBJLoader2.prototype.parse = function ( content ) {
			this.logger.logTimeStart( 'OBJLoader2 parse: ' + this.modelName );

			var parser = new Parser();
			parser.setLogConfig( this.logger.enabled, this.logger.debug );
			parser.setMaterialPerSmoothingGroup( this.materialPerSmoothingGroup );
			parser.setUseIndices( this.useIndices );
			parser.setDisregardNormals( this.disregardNormals );
			// sync code works directly on the material references
			parser.setMaterials( this.builder.getMaterials() );

			var scope = this;
			var onMeshLoaded = function ( payload ) {
				var meshes = scope.builder.processPayload( payload );
				var mesh;
				for ( var i in meshes ) {
					mesh = meshes[ i ];
					scope.loaderRootNode.add( mesh );
				}
			};
			parser.setCallbackBuilder( onMeshLoaded );
			var onProgressScoped = function ( text, numericalValue ) {
				scope.onProgress( 'progressParse', text, numericalValue );
			};
			parser.setCallbackProgress( onProgressScoped );

			if ( content instanceof ArrayBuffer || content instanceof Uint8Array ) {

				this.logger.logInfo( 'Parsing arrayBuffer...' );
				parser.parse( content );

			} else if ( typeof( content ) === 'string' || content instanceof String ) {

				this.logger.logInfo( 'Parsing text...' );
				parser.parseText( content );

			} else {

				throw 'Provided content was neither of type String nor Uint8Array! Aborting...';

			}
			this.logger.logTimeEnd( 'OBJLoader2 parse: ' + this.modelName );

			return this.loaderRootNode;
		};

		/**
		 * Parses OBJ content asynchronously from arraybuffer.
		 * @memberOf THREE.OBJLoader2
		 *
		 * @param {arraybuffer} content OBJ data as Uint8Array
		 * @param {callback} onLoad Called after worker successfully completed loading
		 */
		OBJLoader2.prototype.parseAsync = function ( content, onLoad ) {
			this.logger.logTimeStart( 'OBJLoader2 parseAsync: ' + this.modelName );

			var scope = this;
			var scopedOnLoad = function () {
				onLoad(
					{
						detail: {
							loaderRootNode: scope.loaderRootNode,
							modelName: scope.modelName,
							instanceNo: scope.instanceNo
						}
					}
				);
				scope.logger.logTimeEnd( 'OBJLoader2 parseAsync: ' + scope.modelName );
			};
			var scopedOnMeshLoaded = function ( payload ) {
				var meshes = scope.builder.processPayload( payload );
				var mesh;
				for ( var i in meshes ) {
					mesh = meshes[ i ];
					scope.loaderRootNode.add( mesh );
				}
			};

			this.workerSupport = Validator.verifyInput( this.workerSupport, new THREE.LoaderSupport.WorkerSupport( this.logger ) );
			var buildCode = function ( funcBuildObject, funcBuildSingleton ) {
				var workerCode = '';
				workerCode += '/**\n';
				workerCode += '  * This code was constructed by OBJLoader2 buildCode.\n';
				workerCode += '  */\n\n';
				workerCode += 'THREE = { LoaderSupport: {} };\n\n';
				workerCode += funcBuildObject( 'THREE.LoaderSupport.Validator', Validator );
				workerCode += funcBuildSingleton( 'THREE.LoaderSupport.ConsoleLogger', THREE.LoaderSupport.ConsoleLogger );
				workerCode += funcBuildSingleton( 'THREE.LoaderSupport.LoaderBase', THREE.LoaderSupport.LoaderBase );
				workerCode += funcBuildSingleton( 'Parser', Parser );

				return workerCode;
			};
			this.workerSupport.validate( buildCode, 'Parser' );
			this.workerSupport.setCallbacks( scopedOnMeshLoaded, scopedOnLoad );
			if ( scope.terminateWorkerOnLoad ) this.workerSupport.setTerminateRequested( true );

			var materialNames = {};
			var materials = this.builder.getMaterials();
			for ( var materialName in materials ) {

				materialNames[ materialName ] = materialName;

			}
			this.workerSupport.run(
				{
					params: {
						useAsync: true,
						materialPerSmoothingGroup: this.materialPerSmoothingGroup,
						useIndices: this.useIndices,
						disregardNormals: this.disregardNormals
					},
					logger: {
						debug: this.logger.debug,
						enabled: this.logger.enabled
					},
					materials: {
						// in async case only material names are supplied to parser
						materials: materialNames
					},
					data: {
						input: content,
						options: null
					}
				}
			);
		};


		/**
		 * Parse OBJ data either from ArrayBuffer or string
		 * @class
		 */
		var Parser = (function () {

			function Parser() {
				this.callbackProgress = null;
				this.callbackBuilder = null;

				this.materials = {};
				this.useAsync = false;
				this.materialPerSmoothingGroup = false;
				this.useIndices = false;
				this.disregardNormals = false;

				this.vertices = [];
				this.colors = [];
				this.normals = [];
				this.uvs = [];

				this.rawMesh = {
					objectName: '',
					groupName: '',
					activeMtlName: '',
					mtllibName: '',

					// reset with new mesh
					faceType: -1,
					subGroups: [],
					subGroupInUse: null,
					smoothingGroup: {
						splitMaterials: false,
						normalized: -1,
						real: -1
					},
					counts: {
						doubleIndicesCount: 0,
						faceCount: 0,
						mtlCount: 0,
						smoothingGroupCount: 0
					}
				};

				this.inputObjectCount = 1;
				this.outputObjectCount = 1;
				this.globalCounts = {
					vertices: 0,
					faces: 0,
					doubleIndicesCount: 0,
					currentByte: 0,
					totalBytes: 0
				};
				this.logger = new THREE.LoaderSupport.ConsoleLogger();
			}

			Parser.prototype.resetRawMesh = function () {
				// faces are stored according combined index of group, material and smoothingGroup (0 or not)
				this.rawMesh.subGroups = [];
				this.rawMesh.subGroupInUse = null;
				this.rawMesh.smoothingGroup.normalized = -1;
				this.rawMesh.smoothingGroup.real = -1;

				// this default index is required as it is possible to define faces without 'g' or 'usemtl'
				this.pushSmoothingGroup( 1 );

				this.rawMesh.counts.doubleIndicesCount = 0;
				this.rawMesh.counts.faceCount = 0;
				this.rawMesh.counts.mtlCount = 0;
				this.rawMesh.counts.smoothingGroupCount = 0;
			};

			Parser.prototype.setUseAsync = function ( useAsync ) {
				this.useAsync = useAsync;
			};

			Parser.prototype.setMaterialPerSmoothingGroup = function ( materialPerSmoothingGroup ) {
				this.materialPerSmoothingGroup = materialPerSmoothingGroup;
			};

			Parser.prototype.setUseIndices = function ( useIndices ) {
				this.useIndices = useIndices;
			};

			Parser.prototype.setDisregardNormals = function ( disregardNormals ) {
				this.disregardNormals = disregardNormals;
			};

			Parser.prototype.setMaterials = function ( materials ) {
				this.materials = THREE.LoaderSupport.Validator.verifyInput( materials, this.materials );
				this.materials = THREE.LoaderSupport.Validator.verifyInput( this.materials, {} );
			};

			Parser.prototype.setCallbackBuilder = function ( callbackBuilder ) {
				if ( ! THREE.LoaderSupport.Validator.isValid( callbackBuilder ) ) throw 'Unable to run as no "builder" callback is set.';
				this.callbackBuilder = callbackBuilder;
			};

			Parser.prototype.setCallbackProgress = function ( callbackProgress ) {
				this.callbackProgress = callbackProgress;
			};

			Parser.prototype.setLogConfig = function ( enabled, debug ) {
				this.logger.setEnabled( enabled );
				this.logger.setDebug( debug );
			};

			Parser.prototype.configure = function () {
				this.pushSmoothingGroup( 1 );

				if ( this.logger.isEnabled() ) {

					var matKeys = Object.keys( this.materials );
					var matNames = ( matKeys.length > 0 ) ? '\n\tmaterialNames:\n\t\t- ' + matKeys.join( '\n\t\t- ' ) : '\n\tmaterialNames: None';
					var printedConfig = 'OBJLoader2.Parser configuration:'
						+ matNames
						+ '\n\tuseAsync: ' + this.useAsync
						+ '\n\tmaterialPerSmoothingGroup: ' + this.materialPerSmoothingGroup
						+ '\n\tuseIndices: ' + this.useIndices
						+ '\n\tdisregardNormals: ' + this.disregardNormals
						+ '\n\tcallbackBuilderName: ' + this.callbackBuilder.name
						+ '\n\tcallbackProgressName: ' + this.callbackProgress.name;
					this.logger.logInfo( printedConfig );
				}
			};

			/**
			 * Parse the provided arraybuffer
			 * @memberOf Parser
			 *
			 * @param {Uint8Array} arrayBuffer OBJ data as Uint8Array
			 */
			Parser.prototype.parse = function ( arrayBuffer ) {
				this.logger.logTimeStart( 'OBJLoader2.Parser.parse' );
				this.configure();

				var arrayBufferView = new Uint8Array( arrayBuffer );
				var length = arrayBufferView.byteLength;
				this.globalCounts.totalBytes = length;
				var buffer = new Array( 128 );
				var bufferPointer = 0;
				var slashSpacePattern = new Array( 16 );
				var slashSpacePatternPointer = 0;
				var code;
				var word = '';
				var i = 0;
				for ( ; i < length; i++ ) {

					code = arrayBufferView[ i ];
					switch ( code ) {
						// space
						case 32:
							if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
							slashSpacePattern[ slashSpacePatternPointer++ ] = 0;
							word = '';
							break;
						// slash
						case 47:
							if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
							slashSpacePattern[ slashSpacePatternPointer++ ] = 1;
							word = '';
							break;

						// LF
						case 10:
							if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
							word = '';
							this.globalCounts.currentByte = i;
							this.processLine( buffer, bufferPointer, slashSpacePattern, slashSpacePatternPointer );
							bufferPointer = 0;
							slashSpacePatternPointer = 0;
							break;

						// CR
						case 13:
							break;

						default:
							word += String.fromCharCode( code );
							break;
					}
				}
				this.finalizeParsing();
				this.logger.logTimeEnd( 'OBJLoader2.Parser.parse' );
			};

			/**
			 * Parse the provided text
			 * @memberOf Parser
			 *
			 * @param {string} text OBJ data as string
			 */
			Parser.prototype.parseText = function ( text ) {
				this.logger.logTimeStart( 'OBJLoader2.Parser.parseText' );
				this.configure();

				var length = text.length;
				this.globalCounts.totalBytes = length;
				var buffer = new Array( 128 );
				var bufferPointer = 0;
				var slashSpacePattern = new Array( 16 );
				var slashSpacePatternPointer = 0;
				var char;
				var word = '';
				var i = 0;
				for ( ; i < length; i++ ) {

					char = text[ i ];
					switch ( char ) {
						case ' ':
							if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
							slashSpacePattern[ slashSpacePatternPointer++ ] = 0;
							word = '';
							break;

						case '/':
							if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
							slashSpacePattern[ slashSpacePatternPointer++ ] = 1;
							word = '';
							break;

						case '\n':
							if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
							word = '';
							this.globalCounts.currentByte = i;
							this.processLine( buffer, bufferPointer, slashSpacePattern, slashSpacePatternPointer );
							bufferPointer = 0;
							slashSpacePatternPointer = 0;
							break;

						case '\r':
							break;

						default:
							word += char;
					}
				}
				this.finalizeParsing();
				this.logger.logTimeEnd( 'OBJLoader2.Parser.parseText' );
			};

			Parser.prototype.processLine = function ( buffer, bufferPointer, slashSpacePattern, slashSpacePatternPointer ) {
				if ( bufferPointer < 1 ) return;

				var countSlashes = function ( slashSpacePattern, slashSpacePatternPointer ) {
					var slashesCount = 0;
					for ( var i = 0; i < slashSpacePatternPointer; i++ ) {
						slashesCount += slashSpacePattern[ i ];
					}
					return slashesCount;
				};

				var concatStringBuffer = function ( buffer, bufferPointer, slashSpacePattern ) {
					var concatBuffer = '';
					if ( bufferPointer === 2 ) {

						concatBuffer = buffer[ 1 ];

					} else {

						var bufferLength = bufferPointer - 1;
						for ( var i = 1; i < bufferLength; i++ ) {

							concatBuffer += buffer[ i ] + ( slashSpacePattern[ i ] === 0 ? ' ' : '/' );

						}
						concatBuffer += buffer[ bufferLength ];

					}
					return concatBuffer;
				};

				var flushStringBuffer = function ( buffer, bufferPointer ) {
					for ( var i = 0; i < bufferPointer; i++ ) {
						buffer[ i ] = '';
					}
				};

				switch ( buffer[ 0 ] ) {
					case 'v':
						this.vertices.push( parseFloat( buffer[ 1 ] ) );
						this.vertices.push( parseFloat( buffer[ 2 ] ) );
						this.vertices.push( parseFloat( buffer[ 3 ] ) );
						if ( bufferPointer > 4 ) {

							this.colors.push( parseFloat( buffer[ 4 ] ) );
							this.colors.push( parseFloat( buffer[ 5 ] ) );
							this.colors.push( parseFloat( buffer[ 6 ] ) );

						}
						break;

					case 'vt':
						this.uvs.push( parseFloat( buffer[ 1 ] ) );
						this.uvs.push( parseFloat( buffer[ 2 ] ) );
						break;

					case 'vn':
						this.normals.push( parseFloat( buffer[ 1 ] ) );
						this.normals.push( parseFloat( buffer[ 2 ] ) );
						this.normals.push( parseFloat( buffer[ 3 ] ) );
						break;

					case 'f':
						var slashesCount = countSlashes( slashSpacePattern, slashSpacePatternPointer );
						var bufferLength = bufferPointer - 1;

						// "f vertex ..."
						if ( slashesCount === 0 ) {

							this.checkFaceType( 0 );

							// "f vertex/uv ..."
						} else if  ( bufferLength === slashesCount * 2 ) {

							this.checkFaceType( 1 );

							// "f vertex/uv/normal ..."
						} else if  ( bufferLength * 2 === slashesCount * 3 ) {

							this.checkFaceType( 2 );

							// "f vertex//normal ..."
						} else {

							this.checkFaceType( 3 );

						}
						this.processFaces( buffer, bufferLength );
						break;

					case 'l':
						this.checkFaceType( 4 );
						this.processLinesOrPoints( buffer, bufferPointer, countSlashes( slashSpacePattern, slashSpacePatternPointer ) );
						break;

					case 'p':
						this.checkFaceType( 5 );
						this.processLinesOrPoints( buffer, bufferPointer, 0 );
						break;

					case 's':
						this.pushSmoothingGroup( buffer[ 1 ] );
						flushStringBuffer( buffer, bufferPointer );
						break;

					case 'g':
						// 'g' leads to creation of mesh if valid data (faces declaration was done before), otherwise only groupName gets set
						this.processCompletedMesh();
						this.rawMesh.groupName = THREE.LoaderSupport.Validator.verifyInput( concatStringBuffer( buffer, bufferPointer, slashSpacePattern ), '' );
						flushStringBuffer( buffer, bufferPointer );
						break;

					case 'o':
						// 'o' is pure meta-information and does not result in creation of new meshes
						this.rawMesh.objectName = THREE.LoaderSupport.Validator.verifyInput( concatStringBuffer( buffer, bufferPointer, slashSpacePattern ), '' );
						flushStringBuffer( buffer, bufferPointer );
						break;

					case 'mtllib':
						this.rawMesh.mtllibName = THREE.LoaderSupport.Validator.verifyInput( concatStringBuffer( buffer, bufferPointer, slashSpacePattern ), '' );
						flushStringBuffer( buffer, bufferPointer );
						break;

					case 'usemtl':
						var mtlName = concatStringBuffer( buffer, bufferPointer, slashSpacePattern );
						if ( this.rawMesh.activeMtlName !== mtlName && THREE.LoaderSupport.Validator.isValid( mtlName ) ) {

							this.rawMesh.activeMtlName = mtlName;
							this.rawMesh.counts.mtlCount++;
							this.checkSubGroup();

						}
						flushStringBuffer( buffer, bufferPointer );
						break;

					default:
						break;
				}
			};

			Parser.prototype.pushSmoothingGroup = function ( smoothingGroup ) {
				var smoothingGroupInt = parseInt( smoothingGroup );
				if ( isNaN( smoothingGroupInt ) ) {
					smoothingGroupInt = smoothingGroup === "off" ? 0 : 1;
				}

				var smoothCheck = this.rawMesh.smoothingGroup.normalized;
				this.rawMesh.smoothingGroup.normalized = this.rawMesh.smoothingGroup.splitMaterials ? smoothingGroupInt : ( smoothingGroupInt === 0 ) ? 0 : 1;
				this.rawMesh.smoothingGroup.real = smoothingGroupInt;

				if ( smoothCheck !== smoothingGroupInt ) {

					this.rawMesh.counts.smoothingGroupCount++;
					this.checkSubGroup();

				}
			};

			/**
			 * Expanded faceTypes include all four face types, both line types and the point type
			 * faceType = 0: "f vertex ..."
			 * faceType = 1: "f vertex/uv ..."
			 * faceType = 2: "f vertex/uv/normal ..."
			 * faceType = 3: "f vertex//normal ..."
			 * faceType = 4: "l vertex/uv ..." or "l vertex ..."
			 * faceType = 5: "p vertex ..."
			 */
			Parser.prototype.checkFaceType = function ( faceType ) {
				if ( this.rawMesh.faceType !== faceType ) {

					this.processCompletedMesh();
					this.rawMesh.faceType = faceType;
					this.checkSubGroup();

				}
			};

			Parser.prototype.checkSubGroup = function () {
				var index = this.rawMesh.activeMtlName + '|' + this.rawMesh.smoothingGroup.normalized;
				this.rawMesh.subGroupInUse = this.rawMesh.subGroups[ index ];

				if ( ! THREE.LoaderSupport.Validator.isValid( this.rawMesh.subGroupInUse ) ) {

					this.rawMesh.subGroupInUse = {
						index: index,
						objectName: this.rawMesh.objectName,
						groupName: this.rawMesh.groupName,
						materialName: this.rawMesh.activeMtlName,
						smoothingGroup: this.rawMesh.smoothingGroup.normalized,
						vertices: [],
						indexMappingsCount: 0,
						indexMappings: [],
						indices: [],
						colors: [],
						uvs: [],
						normals: []
					};
					this.rawMesh.subGroups[ index ] = this.rawMesh.subGroupInUse;

				}
			};

			Parser.prototype.processFaces = function ( buffer, bufferLength ) {
				var i, length;

				// "f vertex ..."
				if ( this.rawMesh.faceType === 0 ) {

					for ( i = 2, length = bufferLength; i < length; i ++ ) {

						this.buildFace( buffer[ 1 ] );
						this.buildFace( buffer[ i ] );
						this.buildFace( buffer[ i + 1 ] );

					}

					// "f vertex/uv ..."
				} else if  ( this.rawMesh.faceType === 1 ) {

					for ( i = 3, length = bufferLength - 2; i < length; i += 2 ) {

						this.buildFace( buffer[ 1 ], buffer[ 2 ] );
						this.buildFace( buffer[ i ], buffer[ i + 1 ] );
						this.buildFace( buffer[ i + 2 ], buffer[ i + 3 ] );

					}

					// "f vertex/uv/normal ..."
				} else if  ( this.rawMesh.faceType === 2 ) {

					for ( i = 4, length = bufferLength - 3; i < length; i += 3 ) {

						this.buildFace( buffer[ 1 ], buffer[ 2 ], buffer[ 3 ] );
						this.buildFace( buffer[ i ], buffer[ i + 1 ], buffer[ i + 2 ] );
						this.buildFace( buffer[ i + 3 ], buffer[ i + 4 ], buffer[ i + 5 ] );

					}

					// "f vertex//normal ..."
				} else {

					for ( i = 3, length = bufferLength - 2; i < length; i += 2 ) {

						this.buildFace( buffer[ 1 ], undefined, buffer[ 2 ] );
						this.buildFace( buffer[ i ], undefined, buffer[ i + 1 ] );
						this.buildFace( buffer[ i + 2 ], undefined, buffer[ i + 3 ] );

					}

				}
			};

			Parser.prototype.buildFace = function ( faceIndexV, faceIndexU, faceIndexN ) {
				if ( this.disregardNormals ) faceIndexN = undefined;
				var scope = this;
				var updateSubGroupInUse = function () {

					var faceIndexVi = parseInt( faceIndexV );
					var indexPointerV = 3 * ( faceIndexVi > 0 ? faceIndexVi - 1 : faceIndexVi + scope.vertices.length / 3 );

					var vertices = scope.rawMesh.subGroupInUse.vertices;
					vertices.push( scope.vertices[ indexPointerV++ ] );
					vertices.push( scope.vertices[ indexPointerV++ ] );
					vertices.push( scope.vertices[ indexPointerV ] );

					var indexPointerC = scope.colors.length > 0 ? indexPointerV : null;
					if ( indexPointerC !== null ) {

						var colors = scope.rawMesh.subGroupInUse.colors;
						colors.push( scope.colors[ indexPointerC++ ] );
						colors.push( scope.colors[ indexPointerC++ ] );
						colors.push( scope.colors[ indexPointerC ] );

					}

					if ( faceIndexU ) {

						var faceIndexUi = parseInt( faceIndexU );
						var indexPointerU = 2 * ( faceIndexUi > 0 ? faceIndexUi - 1 : faceIndexUi + scope.uvs.length / 2 );
						var uvs = scope.rawMesh.subGroupInUse.uvs;
						uvs.push( scope.uvs[ indexPointerU++ ] );
						uvs.push( scope.uvs[ indexPointerU ] );

					}
					if ( faceIndexN ) {

						var faceIndexNi = parseInt( faceIndexN );
						var indexPointerN = 3 * ( faceIndexNi > 0 ? faceIndexNi - 1 : faceIndexNi + scope.normals.length / 3 );
						var normals = scope.rawMesh.subGroupInUse.normals;
						normals.push( scope.normals[ indexPointerN++ ] );
						normals.push( scope.normals[ indexPointerN++ ] );
						normals.push( scope.normals[ indexPointerN ] );

					}
				};

				if ( this.useIndices ) {

					var mappingName = faceIndexV + ( faceIndexU ? '_' + faceIndexU : '_n' ) + ( faceIndexN ? '_' + faceIndexN : '_n' );
					var indicesPointer = this.rawMesh.subGroupInUse.indexMappings[ mappingName ];
					if ( THREE.LoaderSupport.Validator.isValid( indicesPointer ) ) {

						this.rawMesh.counts.doubleIndicesCount++;

					} else {

						indicesPointer = this.rawMesh.subGroupInUse.vertices.length / 3;
						updateSubGroupInUse();
						this.rawMesh.subGroupInUse.indexMappings[ mappingName ] = indicesPointer;
						this.rawMesh.subGroupInUse.indexMappingsCount++;

					}
					this.rawMesh.subGroupInUse.indices.push( indicesPointer );

				} else {

					updateSubGroupInUse();

				}
				this.rawMesh.counts.faceCount++;
			};

			/*
			 * Support for lines with or without texture or Points (just Vertex).
			 * First element in indexArray is the line/point identification
			 *
			 * : "l vertex/uv		vertex/uv 		..."
			 * 1: "l vertex			vertex 			..."
			 */
			Parser.prototype.processLinesOrPoints = function ( buffer, bufferPointer, slashCount ) {
				var i = 1;
				var length;
				var bufferLength = bufferPointer - 1;

				if ( bufferLength === slashCount * 2 ) {

					for ( length = bufferPointer; i < length; i += 2 ) this.buildFace( buffer[ i ], buffer[ i + 1 ] );

				} else {

					for ( length = bufferPointer; i < length; i ++ ) this.buildFace( buffer[ i ] );

				}
			};

			Parser.prototype.createRawMeshReport = function ( inputObjectCount ) {
				return 'Input Object number: ' + inputObjectCount +
					'\n\tObject name: ' + this.rawMesh.objectName +
					'\n\tGroup name: ' + this.rawMesh.groupName +
					'\n\tMtllib name: ' + this.rawMesh.mtllibName +
					'\n\tVertex count: ' + this.vertices.length / 3 +
					'\n\tNormal count: ' + this.normals.length / 3 +
					'\n\tUV count: ' + this.uvs.length / 2 +
					'\n\tSmoothingGroup count: ' + this.rawMesh.counts.smoothingGroupCount +
					'\n\tMaterial count: ' + this.rawMesh.counts.mtlCount +
					'\n\tReal MeshOutputGroup count: ' + this.rawMesh.subGroups.length;
			};

			/**
			 * Clear any empty subGroup and calculate absolute vertex, normal and uv counts
			 */
			Parser.prototype.finalizeRawMesh = function () {
				var meshOutputGroupTemp = [];
				var meshOutputGroup;
				var absoluteVertexCount = 0;
				var absoluteIndexMappingsCount = 0;
				var absoluteIndexCount = 0;
				var absoluteColorCount = 0;
				var absoluteNormalCount = 0;
				var absoluteUvCount = 0;
				var indices;
				for ( var name in this.rawMesh.subGroups ) {

					meshOutputGroup = this.rawMesh.subGroups[ name ];
					if ( meshOutputGroup.vertices.length > 0 ) {

						indices = meshOutputGroup.indices;
						if ( indices.length > 0 && absoluteIndexMappingsCount > 0 ) {

							for ( var i in indices ) indices[ i ] = indices[ i ] + absoluteIndexMappingsCount;

						}
						meshOutputGroupTemp.push( meshOutputGroup );
						absoluteVertexCount += meshOutputGroup.vertices.length;
						absoluteIndexMappingsCount += meshOutputGroup.indexMappingsCount;
						absoluteIndexCount += meshOutputGroup.indices.length;
						absoluteColorCount += meshOutputGroup.colors.length;
						absoluteUvCount += meshOutputGroup.uvs.length;
						absoluteNormalCount += meshOutputGroup.normals.length;

					}
				}

				// do not continue if no result
				var result = null;
				if ( meshOutputGroupTemp.length > 0 ) {

					result = {
						name: this.rawMesh.groupName !== '' ? this.rawMesh.groupName : this.rawMesh.objectName,
						subGroups: meshOutputGroupTemp,
						absoluteVertexCount: absoluteVertexCount,
						absoluteIndexCount: absoluteIndexCount,
						absoluteColorCount: absoluteColorCount,
						absoluteNormalCount: absoluteNormalCount,
						absoluteUvCount: absoluteUvCount,
						faceCount: this.rawMesh.counts.faceCount,
						doubleIndicesCount: this.rawMesh.counts.doubleIndicesCount
					};

				}
				return result;
			};

			Parser.prototype.processCompletedMesh = function () {
				var result = this.finalizeRawMesh();
				if ( THREE.LoaderSupport.Validator.isValid( result ) ) {

					if ( this.colors.length > 0 && this.colors.length !== this.vertices.length ) {

						throw 'Vertex Colors were detected, but vertex count and color count do not match!';

					}
					if ( this.logger.isDebug() ) this.logger.logDebug( this.createRawMeshReport( this.inputObjectCount ) );
					this.inputObjectCount++;

					this.buildMesh( result );
					var progressBytesPercent = this.globalCounts.currentByte / this.globalCounts.totalBytes;
					this.callbackProgress( 'Completed [o: ' + this.rawMesh.objectName + ' g:' + this.rawMesh.groupName + '] Total progress: ' + ( progressBytesPercent * 100 ).toFixed( 2 ) + '%', progressBytesPercent );
					this.resetRawMesh();
					return true;

				} else {

					return false;
				}
			};

			/**
			 * SubGroups are transformed to too intermediate format that is forwarded to the Builder.
			 * It is ensured that SubGroups only contain objects with vertices (no need to check).
			 *
			 * @param result
			 */
			Parser.prototype.buildMesh = function ( result ) {
				var meshOutputGroups = result.subGroups;

				var vertexFA = new Float32Array( result.absoluteVertexCount );
				this.globalCounts.vertices += result.absoluteVertexCount / 3;
				this.globalCounts.faces += result.faceCount;
				this.globalCounts.doubleIndicesCount += result.doubleIndicesCount;
				var indexUA = ( result.absoluteIndexCount > 0 ) ? new Uint32Array( result.absoluteIndexCount ) : null;
				var colorFA = ( result.absoluteColorCount > 0 ) ? new Float32Array( result.absoluteColorCount ) : null;
				var normalFA = ( result.absoluteNormalCount > 0 ) ? new Float32Array( result.absoluteNormalCount ) : null;
				var uvFA = ( result.absoluteUvCount > 0 ) ? new Float32Array( result.absoluteUvCount ) : null;
				var haveVertexColors = THREE.LoaderSupport.Validator.isValid( colorFA );

				var meshOutputGroup;
				var materialNames = [];

				var createMultiMaterial = ( meshOutputGroups.length > 1 );
				var materialIndex = 0;
				var materialIndexMapping = [];
				var selectedMaterialIndex;
				var materialGroup;
				var materialGroups = [];

				var vertexFAOffset = 0;
				var indexUAOffset = 0;
				var colorFAOffset = 0;
				var normalFAOffset = 0;
				var uvFAOffset = 0;
				var materialGroupOffset = 0;
				var materialGroupLength = 0;

				var materialOrg, material, materialName, materialNameOrg;
				// only one specific face type
				for ( var oodIndex in meshOutputGroups ) {

					if ( ! meshOutputGroups.hasOwnProperty( oodIndex ) ) continue;
					meshOutputGroup = meshOutputGroups[ oodIndex ];

					materialNameOrg = meshOutputGroup.materialName;
					if ( this.rawMesh.faceType < 4 ) {

						materialName = materialNameOrg + ( haveVertexColors ? '_vertexColor' : '' ) + ( meshOutputGroup.smoothingGroup === 0 ? '_flat' : '' );


					} else {

						materialName = this.rawMesh.faceType === 4 ? 'defaultLineMaterial' : 'defaultPointMaterial';

					}
					materialOrg = this.materials[ materialNameOrg ];
					material = this.materials[ materialName ];

					// both original and derived names do not lead to an existing material => need to use a default material
					if ( ! THREE.LoaderSupport.Validator.isValid( materialOrg ) && ! THREE.LoaderSupport.Validator.isValid( material ) ) {

						var defaultMaterialName = haveVertexColors ? 'defaultVertexColorMaterial' : 'defaultMaterial';
						materialOrg = this.materials[ defaultMaterialName ];
						this.logger.logWarn( 'object_group "' + meshOutputGroup.objectName + '_' +
							meshOutputGroup.groupName + '" was defined with unresolvable material "' +
							materialNameOrg + '"! Assigning "' + defaultMaterialName + '".' );
						materialNameOrg = defaultMaterialName;

						// if names are identical then there is no need for later manipulation
						if ( materialNameOrg === materialName ) {

							material = materialOrg;
							materialName = defaultMaterialName;

						}

					}
					if ( ! THREE.LoaderSupport.Validator.isValid( material ) ) {

						var materialCloneInstructions = {
							materialNameOrg: materialNameOrg,
							materialName: materialName,
							materialProperties: {
								vertexColors: haveVertexColors ? 2 : 0,
								flatShading: meshOutputGroup.smoothingGroup === 0
							}
						};
						var payload = {
							cmd: 'materialData',
							materials: {
								materialCloneInstructions: materialCloneInstructions
							}
						};
						this.callbackBuilder( payload );

						// fake entry for async; sync Parser always works on material references (Builder update directly visible here)
						if ( this.useAsync ) this.materials[ materialName ] = materialCloneInstructions;

					}

					if ( createMultiMaterial ) {

						// re-use material if already used before. Reduces materials array size and eliminates duplicates
						selectedMaterialIndex = materialIndexMapping[ materialName ];
						if ( ! selectedMaterialIndex ) {

							selectedMaterialIndex = materialIndex;
							materialIndexMapping[ materialName ] = materialIndex;
							materialNames.push( materialName );
							materialIndex++;

						}
						materialGroupLength = this.useIndices ? meshOutputGroup.indices.length : meshOutputGroup.vertices.length / 3;
						materialGroup = {
							start: materialGroupOffset,
							count: materialGroupLength,
							index: selectedMaterialIndex
						};
						materialGroups.push( materialGroup );
						materialGroupOffset += materialGroupLength;

					} else {

						materialNames.push( materialName );

					}

					vertexFA.set( meshOutputGroup.vertices, vertexFAOffset );
					vertexFAOffset += meshOutputGroup.vertices.length;

					if ( indexUA ) {

						indexUA.set( meshOutputGroup.indices, indexUAOffset );
						indexUAOffset += meshOutputGroup.indices.length;

					}

					if ( colorFA ) {

						colorFA.set( meshOutputGroup.colors, colorFAOffset );
						colorFAOffset += meshOutputGroup.colors.length;

					}

					if ( normalFA ) {

						normalFA.set( meshOutputGroup.normals, normalFAOffset );
						normalFAOffset += meshOutputGroup.normals.length;

					}
					if ( uvFA ) {

						uvFA.set( meshOutputGroup.uvs, uvFAOffset );
						uvFAOffset += meshOutputGroup.uvs.length;

					}

					if ( this.logger.isDebug() ) {
						var materialIndexLine = THREE.LoaderSupport.Validator.isValid( selectedMaterialIndex ) ? '\n\t\tmaterialIndex: ' + selectedMaterialIndex : '';
						var createdReport = '\tOutput Object no.: ' + this.outputObjectCount +
							'\n\t\tgroupName: ' + meshOutputGroup.groupName +
							'\n\t\tIndex: ' + meshOutputGroup.index +
							'\n\t\tfaceType: ' + this.rawMesh.faceType +
							'\n\t\tmaterialName: ' + meshOutputGroup.materialName +
							'\n\t\tsmoothingGroup: ' + meshOutputGroup.smoothingGroup +
							materialIndexLine +
							'\n\t\tobjectName: ' + meshOutputGroup.objectName +
							'\n\t\t#vertices: ' + meshOutputGroup.vertices.length / 3 +
							'\n\t\t#indices: ' + meshOutputGroup.indices.length +
							'\n\t\t#colors: ' + meshOutputGroup.colors.length / 3 +
							'\n\t\t#uvs: ' + meshOutputGroup.uvs.length / 2 +
							'\n\t\t#normals: ' + meshOutputGroup.normals.length / 3;
						this.logger.logDebug( createdReport );
					}

				}

				this.outputObjectCount++;
				this.callbackBuilder(
					{
						cmd: 'meshData',
						progress: {
							numericalValue: this.globalCounts.currentByte / this.globalCounts.totalBytes
						},
						params: {
							meshName: result.name
						},
						materials: {
							multiMaterial: createMultiMaterial,
							materialNames: materialNames,
							materialGroups: materialGroups
						},
						buffers: {
							vertices: vertexFA,
							indices: indexUA,
							colors: colorFA,
							normals: normalFA,
							uvs: uvFA
						},
						// 0: mesh, 1: line, 2: point
						geometryType: this.rawMesh.faceType < 4 ? 0 : ( this.rawMesh.faceType === 4 ) ? 1 : 2
					},
					[ vertexFA.buffer ],
					THREE.LoaderSupport.Validator.isValid( indexUA ) ? [ indexUA.buffer ] : null,
					THREE.LoaderSupport.Validator.isValid( colorFA ) ? [ colorFA.buffer ] : null,
					THREE.LoaderSupport.Validator.isValid( normalFA ) ? [ normalFA.buffer ] : null,
					THREE.LoaderSupport.Validator.isValid( uvFA ) ? [ uvFA.buffer ] : null
				);
			};

			Parser.prototype.finalizeParsing = function () {
				this.logger.logInfo( 'Global output object count: ' + this.outputObjectCount );
				if ( this.processCompletedMesh() && this.logger.isEnabled() ) {

					var parserFinalReport = 'Overall counts: ' +
						'\n\tVertices: ' + this.globalCounts.vertices +
						'\n\tFaces: ' + this.globalCounts.faces +
						'\n\tMultiple definitions: ' + this.globalCounts.doubleIndicesCount;
					this.logger.logInfo( parserFinalReport );

				}
			};

			return Parser;
		})();

		/**
		 * Utility method for loading an mtl file according resource description. Provide url or content.
		 * @memberOf THREE.OBJLoader2
		 *
		 * @param {string} url URL to the file
		 * @param {Object} content The file content as arraybuffer or text
		 * @param {function} callbackOnLoad Callback to be called after successful load
		 * @param {string} [crossOrigin] CORS value
	 	 * @param {Object} [materialOptions] Set material loading options for MTLLoader
		 */
		OBJLoader2.prototype.loadMtl = function ( url, content, callbackOnLoad, crossOrigin, materialOptions ) {
			var resource = new THREE.LoaderSupport.ResourceDescriptor( url, 'MTL' );
			resource.setContent( content );
			this._loadMtl( resource, callbackOnLoad, crossOrigin, materialOptions );
		};


		OBJLoader2.prototype._loadMtl = function ( resource, callbackOnLoad, crossOrigin, materialOptions ) {
			if ( THREE.MTLLoader === undefined ) console.error( '"THREE.MTLLoader" is not available. "THREE.OBJLoader2" requires it for loading MTL files.' );
			if ( Validator.isValid( resource ) ) this.logger.logTimeStart( 'Loading MTL: ' + resource.name );

			var materials = [];
			var scope = this;
			var processMaterials = function ( materialCreator ) {
				var materialCreatorMaterials = [];
				if ( Validator.isValid( materialCreator ) ) {

					materialCreator.preload();
					materialCreatorMaterials = materialCreator.materials;
					for ( var materialName in materialCreatorMaterials ) {

						if ( materialCreatorMaterials.hasOwnProperty( materialName ) ) {

							materials[ materialName ] = materialCreatorMaterials[ materialName ];

						}
					}
				}

				if ( Validator.isValid( resource ) ) scope.logger.logTimeEnd( 'Loading MTL: ' + resource.name );
				callbackOnLoad( materials, materialCreator );
			};

			var mtlLoader = new THREE.MTLLoader( this.manager );
			crossOrigin = Validator.verifyInput( crossOrigin, 'anonymous' );
			mtlLoader.setCrossOrigin( crossOrigin );
			if ( Validator.isValid( materialOptions ) ) mtlLoader.setMaterialOptions( materialOptions );

			// fast-fail
			if ( ! Validator.isValid( resource ) || ( ! Validator.isValid( resource.content ) && ! Validator.isValid( resource.url ) ) ) {

				processMaterials();

			} else {

				mtlLoader.setPath( resource.path );
				if ( Validator.isValid( resource.content ) ) {

					processMaterials( Validator.isValid( resource.content ) ? mtlLoader.parse( resource.content ) : null );

				} else if ( Validator.isValid( resource.url ) ) {

					var onError = function ( event ) {
						var output = 'Error occurred while downloading "' + resource.url + '"';
						scope.logger.logError( output, event instanceof ProgressEvent ? [ 'Status: ' + event.currentTarget.statusText ] : null );
						throw output;
					};

					mtlLoader.load( resource.name, processMaterials, undefined, onError );

				}
			}
		};

		return OBJLoader2;
	})();

	/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */(function() {var l=void 0,aa=this;function r(c,d){var a=c.split("."),b=aa;!(a[0]in b)&&b.execScript&&b.execScript("var "+a[0]);for(var e;a.length&&(e=a.shift());)!a.length&&d!==l?b[e]=d:b=b[e]?b[e]:b[e]={};}var t="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array&&"undefined"!==typeof DataView;function v(c){var d=c.length,a=0,b=Number.POSITIVE_INFINITY,e,f,g,h,k,m,n,p,s,x;for(p=0;p<d;++p)c[p]>a&&(a=c[p]), c[p]<b&&(b=c[p]);e=1<<a;f=new (t?Uint32Array:Array)(e);g=1;h=0;for(k=2;g<=a;){for(p=0;p<d;++p)if(c[p]===g){m=0;n=h;for(s=0;s<g;++s)m=m<<1|n&1, n>>=1;x=g<<16|p;for(s=m;s<e;s+=k)f[s]=x;++h;}++g;h<<=1;k<<=1;}return[f,a,b]}function w(c,d){this.g=[];this.h=32768;this.d=this.f=this.a=this.l=0;this.input=t?new Uint8Array(c):c;this.m=!1;this.i=y;this.r=!1;if(d||!(d={}))d.index&&(this.a=d.index), d.bufferSize&&(this.h=d.bufferSize), d.bufferType&&(this.i=d.bufferType), d.resize&&(this.r=d.resize);switch(this.i){case A:this.b=32768;this.c=new (t?Uint8Array:Array)(32768+this.h+258);break;case y:this.b=0;this.c=new (t?Uint8Array:Array)(this.h);this.e=this.z;this.n=this.v;this.j=this.w;break;default:throw Error("invalid inflate mode");
	}}var A=0,y=1,B={t:A,s:y};
	w.prototype.k=function(){for(;!this.m;){var c=C(this,3);c&1&&(this.m=!0);c>>>=1;switch(c){case 0:var d=this.input,a=this.a,b=this.c,e=this.b,f=d.length,g=l,h=l,k=b.length,m=l;this.d=this.f=0;if(a+1>=f)throw Error("invalid uncompressed block header: LEN");g=d[a++]|d[a++]<<8;if(a+1>=f)throw Error("invalid uncompressed block header: NLEN");h=d[a++]|d[a++]<<8;if(g===~h)throw Error("invalid uncompressed block header: length verify");if(a+g>d.length)throw Error("input buffer is broken");switch(this.i){case A:for(;e+
	g>b.length;){m=k-e;g-=m;if(t)b.set(d.subarray(a,a+m),e), e+=m, a+=m;else for(;m--;)b[e++]=d[a++];this.b=e;b=this.e();e=this.b;}break;case y:for(;e+g>b.length;)b=this.e({p:2});break;default:throw Error("invalid inflate mode");}if(t)b.set(d.subarray(a,a+g),e), e+=g, a+=g;else for(;g--;)b[e++]=d[a++];this.a=a;this.b=e;this.c=b;break;case 1:this.j(ba,ca);break;case 2:for(var n=C(this,5)+257,p=C(this,5)+1,s=C(this,4)+4,x=new (t?Uint8Array:Array)(D.length),S=l,T=l,U=l,u=l,M=l,F=l,z=l,q=l,V=l,q=0;q<s;++q)x[D[q]]=
	C(this,3);if(!t){q=s;for(s=x.length;q<s;++q)x[D[q]]=0;}S=v(x);u=new (t?Uint8Array:Array)(n+p);q=0;for(V=n+p;q<V;)switch(M=E(this,S), M){case 16:for(z=3+C(this,2);z--;)u[q++]=F;break;case 17:for(z=3+C(this,3);z--;)u[q++]=0;F=0;break;case 18:for(z=11+C(this,7);z--;)u[q++]=0;F=0;break;default:F=u[q++]=M;}T=t?v(u.subarray(0,n)):v(u.slice(0,n));U=t?v(u.subarray(n)):v(u.slice(n));this.j(T,U);break;default:throw Error("unknown BTYPE: "+c);}}return this.n()};
	var G=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],D=t?new Uint16Array(G):G,H=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],I=t?new Uint16Array(H):H,J=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],K=t?new Uint8Array(J):J,L=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],da=t?new Uint16Array(L):L,ea=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,
	13,13],N=t?new Uint8Array(ea):ea,O=new (t?Uint8Array:Array)(288),P,fa;P=0;for(fa=O.length;P<fa;++P)O[P]=143>=P?8:255>=P?9:279>=P?7:8;var ba=v(O),Q=new (t?Uint8Array:Array)(30),R,ga;R=0;for(ga=Q.length;R<ga;++R)Q[R]=5;var ca=v(Q);function C(c,d){for(var a=c.f,b=c.d,e=c.input,f=c.a,g=e.length,h;b<d;){if(f>=g)throw Error("input buffer is broken");a|=e[f++]<<b;b+=8;}h=a&(1<<d)-1;c.f=a>>>d;c.d=b-d;c.a=f;return h}
	function E(c,d){for(var a=c.f,b=c.d,e=c.input,f=c.a,g=e.length,h=d[0],k=d[1],m,n;b<k&&!(f>=g);)a|=e[f++]<<b, b+=8;m=h[a&(1<<k)-1];n=m>>>16;if(n>b)throw Error("invalid code length: "+n);c.f=a>>n;c.d=b-n;c.a=f;return m&65535}
	w.prototype.j=function(c,d){var a=this.c,b=this.b;this.o=c;for(var e=a.length-258,f,g,h,k;256!==(f=E(this,c));)if(256>f)b>=e&&(this.b=b, a=this.e(), b=this.b), a[b++]=f;else{g=f-257;k=I[g];0<K[g]&&(k+=C(this,K[g]));f=E(this,d);h=da[f];0<N[f]&&(h+=C(this,N[f]));b>=e&&(this.b=b, a=this.e(), b=this.b);for(;k--;)a[b]=a[b++-h];}for(;8<=this.d;)this.d-=8, this.a--;this.b=b;};
	w.prototype.w=function(c,d){var a=this.c,b=this.b;this.o=c;for(var e=a.length,f,g,h,k;256!==(f=E(this,c));)if(256>f)b>=e&&(a=this.e(), e=a.length), a[b++]=f;else{g=f-257;k=I[g];0<K[g]&&(k+=C(this,K[g]));f=E(this,d);h=da[f];0<N[f]&&(h+=C(this,N[f]));b+k>e&&(a=this.e(), e=a.length);for(;k--;)a[b]=a[b++-h];}for(;8<=this.d;)this.d-=8, this.a--;this.b=b;};
	w.prototype.e=function(){var c=new (t?Uint8Array:Array)(this.b-32768),d=this.b-32768,a,b,e=this.c;if(t)c.set(e.subarray(32768,c.length));else{a=0;for(b=c.length;a<b;++a)c[a]=e[a+32768];}this.g.push(c);this.l+=c.length;if(t)e.set(e.subarray(d,d+32768));else for(a=0;32768>a;++a)e[a]=e[d+a];this.b=32768;return e};
	w.prototype.z=function(c){var d,a=this.input.length/this.a+1|0,b,e,f,g=this.input,h=this.c;c&&("number"===typeof c.p&&(a=c.p), "number"===typeof c.u&&(a+=c.u));2>a?(b=(g.length-this.a)/this.o[2], f=258*(b/2)|0, e=f<h.length?h.length+f:h.length<<1):e=h.length*a;t?(d=new Uint8Array(e), d.set(h)):d=h;return this.c=d};
	w.prototype.n=function(){var c=0,d=this.c,a=this.g,b,e=new (t?Uint8Array:Array)(this.l+(this.b-32768)),f,g,h,k;if(0===a.length)return t?this.c.subarray(32768,this.b):this.c.slice(32768,this.b);f=0;for(g=a.length;f<g;++f){b=a[f];h=0;for(k=b.length;h<k;++h)e[c++]=b[h];}f=32768;for(g=this.b;f<g;++f)e[c++]=d[f];this.g=[];return this.buffer=e};
	w.prototype.v=function(){var c,d=this.b;t?this.r?(c=new Uint8Array(d), c.set(this.c.subarray(0,d))):c=this.c.subarray(0,d):(this.c.length>d&&(this.c.length=d), c=this.c);return this.buffer=c};function W(c,d){var a,b;this.input=c;this.a=0;if(d||!(d={}))d.index&&(this.a=d.index), d.verify&&(this.A=d.verify);a=c[this.a++];b=c[this.a++];switch(a&15){case ha:this.method=ha;break;default:throw Error("unsupported compression method");}if(0!==((a<<8)+b)%31)throw Error("invalid fcheck flag:"+((a<<8)+b)%31);if(b&32)throw Error("fdict flag is not supported");this.q=new w(c,{index:this.a,bufferSize:d.bufferSize,bufferType:d.bufferType,resize:d.resize});}
	W.prototype.k=function(){var c=this.input,d,a;d=this.q.k();this.a=this.q.a;if(this.A){a=(c[this.a++]<<24|c[this.a++]<<16|c[this.a++]<<8|c[this.a++])>>>0;var b=d;if("string"===typeof b){var e=b.split(""),f,g;f=0;for(g=e.length;f<g;f++)e[f]=(e[f].charCodeAt(0)&255)>>>0;b=e;}for(var h=1,k=0,m=b.length,n,p=0;0<m;){n=1024<m?1024:m;m-=n;do h+=b[p++], k+=h;while(--n);h%=65521;k%=65521;}if(a!==(k<<16|h)>>>0)throw Error("invalid adler-32 checksum");}return d};var ha=8;r("Zlib.Inflate",W);r("Zlib.Inflate.prototype.decompress",W.prototype.k);var X={ADAPTIVE:B.s,BLOCK:B.t},Y,Z,$,ia;if(Object.keys)Y=Object.keys(X);else for(Z in Y=[], $=0, X)Y[$++]=Z;$=0;for(ia=Y.length;$<ia;++$)Z=Y[$], r("Zlib.Inflate.BufferType."+Z,X[Z]);}).call(window);

	/**
	 * @author Kyle-Larson https://github.com/Kyle-Larson
	 * @author Takahiro https://github.com/takahirox
	 * @author Lewy Blue https://github.com/looeee
	 *
	 * Loader loads FBX file and generates Group representing FBX scene.
	 * Requires FBX file to be >= 7.0 and in ASCII or to be any version in Binary format.
	 *
	 * Supports:
	 * 	Mesh Generation (Positional Data)
	 * 	Normal Data (Per Vertex Drawing Instance)
	 *	UV Data (Per Vertex Drawing Instance)
	 *	Skinning
	 *	Animation
	 * 	- Separated Animations based on stacks.
	 * 	- Skeletal & Non-Skeletal Animations
	 *	NURBS (Open, Closed and Periodic forms)
	 *
	 * Needs Support:
	 *	Euler rotation order
	 *
	 *
	 * FBX format references:
	 * 	https://wiki.blender.org/index.php/User:Mont29/Foundation/FBX_File_Structure
	 *
	 * 	Binary format specification:
	 *		https://code.blender.org/2013/08/fbx-binary-file-format-specification/
	 *		https://wiki.rogiken.org/specifications/file-format/fbx/ (more detail but Japanese)
	 */

	( function () {

		THREE.FBXLoader = function ( manager ) {

			this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

		};

		Object.assign( THREE.FBXLoader.prototype, {

			load: function ( url, onLoad, onProgress, onError ) {

				var self = this;

				var resourceDirectory = THREE.LoaderUtils.extractUrlBase( url );

				var loader = new THREE.FileLoader( this.manager );
				loader.setResponseType( 'arraybuffer' );
				loader.load( url, function ( buffer ) {

					try {

						var scene = self.parse( buffer, resourceDirectory );
						onLoad( scene );

					} catch ( error ) {

						window.setTimeout( function () {

							if ( onError ) onError( error );

							self.manager.itemError( url );

						}, 0 );

					}

				}, onProgress, onError );

			},

			parse: function ( FBXBuffer, resourceDirectory ) {

				var FBXTree;

				if ( isFbxFormatBinary( FBXBuffer ) ) {

					FBXTree = new BinaryParser().parse( FBXBuffer );

				} else {

					var FBXText = convertArrayBufferToString( FBXBuffer );

					if ( ! isFbxFormatASCII( FBXText ) ) {

						throw new Error( 'THREE.FBXLoader: Unknown format.' );

					}

					if ( getFbxVersion( FBXText ) < 7000 ) {

						throw new Error( 'THREE.FBXLoader: FBX version not supported, FileVersion: ' + getFbxVersion( FBXText ) );

					}

					FBXTree = new TextParser().parse( FBXText );

				}

				// console.log( FBXTree );

				var connections = parseConnections( FBXTree );
				var images = parseImages( FBXTree );
				var textures = parseTextures( FBXTree, new THREE.TextureLoader( this.manager ).setPath( resourceDirectory ), images, connections );
				var materials = parseMaterials( FBXTree, textures, connections );
				var skeletons = parseDeformers( FBXTree, connections );
				var geometryMap = parseGeometries( FBXTree, connections, skeletons );
				var sceneGraph = parseScene( FBXTree, connections, skeletons, geometryMap, materials );

				return sceneGraph;

			}

		} );

		// Parses FBXTree.Connections which holds parent-child connections between objects (e.g. material -> texture, model->geometry )
		// and details the connection type
		function parseConnections( FBXTree ) {

			var connectionMap = new Map();

			if ( 'Connections' in FBXTree ) {

				var rawConnections = FBXTree.Connections.connections;

				rawConnections.forEach( function ( rawConnection ) {

					var fromID = rawConnection[ 0 ];
					var toID = rawConnection[ 1 ];
					var relationship = rawConnection[ 2 ];

					if ( ! connectionMap.has( fromID ) ) {

						connectionMap.set( fromID, {
							parents: [],
							children: []
						} );

					}

					var parentRelationship = { ID: toID, relationship: relationship };
					connectionMap.get( fromID ).parents.push( parentRelationship );

					if ( ! connectionMap.has( toID ) ) {

						connectionMap.set( toID, {
							parents: [],
							children: []
						} );

					}

					var childRelationship = { ID: fromID, relationship: relationship };
					connectionMap.get( toID ).children.push( childRelationship );

				} );

			}

			return connectionMap;

		}

		// Parse FBXTree.Objects.Video for embedded image data
		// These images are connected to textures in FBXTree.Objects.Textures
		// via FBXTree.Connections.
		function parseImages( FBXTree ) {

			var images = {};
			var blobs = {};

			if ( 'Video' in FBXTree.Objects ) {

				var videoNodes = FBXTree.Objects.Video;

				for ( var nodeID in videoNodes ) {

					var videoNode = videoNodes[ nodeID ];

					var id = parseInt( nodeID );

					images[ id ] = videoNode.Filename;

					// raw image data is in videoNode.Content
					if ( 'Content' in videoNode ) {

						var arrayBufferContent = ( videoNode.Content instanceof ArrayBuffer ) && ( videoNode.Content.byteLength > 0 );
						var base64Content = ( typeof videoNode.Content === 'string' ) && ( videoNode.Content !== '' );

						if ( arrayBufferContent || base64Content ) {

							var image = parseImage( videoNodes[ nodeID ] );

							blobs[ videoNode.Filename ] = image;

						}

					}

				}

			}

			for ( var id in images ) {

				var filename = images[ id ];

				if ( blobs[ filename ] !== undefined ) images[ id ] = blobs[ filename ];
				else images[ id ] = images[ id ].split( '\\' ).pop();

			}

			return images;

		}

		// Parse embedded image data in FBXTree.Video.Content
		function parseImage( videoNode ) {

			var content = videoNode.Content;
			var fileName = videoNode.RelativeFilename || videoNode.Filename;
			var extension = fileName.slice( fileName.lastIndexOf( '.' ) + 1 ).toLowerCase();

			var type;

			switch ( extension ) {

				case 'bmp':

					type = 'image/bmp';
					break;

				case 'jpg':
				case 'jpeg':

					type = 'image/jpeg';
					break;

				case 'png':

					type = 'image/png';
					break;

				case 'tif':

					type = 'image/tiff';
					break;

				default:

					console.warn( 'FBXLoader: Image type "' + extension + '" is not supported.' );
					return;

			}

			if ( typeof content === 'string' ) { // ASCII format

				return 'data:' + type + ';base64,' + content;

			} else { // Binary Format

				var array = new Uint8Array( content );
				return window.URL.createObjectURL( new Blob( [ array ], { type: type } ) );

			}

		}

		// Parse nodes in FBXTree.Objects.Texture
		// These contain details such as UV scaling, cropping, rotation etc and are connected
		// to images in FBXTree.Objects.Video
		function parseTextures( FBXTree, loader, images, connections ) {

			var textureMap = new Map();

			if ( 'Texture' in FBXTree.Objects ) {

				var textureNodes = FBXTree.Objects.Texture;
				for ( var nodeID in textureNodes ) {

					var texture = parseTexture( textureNodes[ nodeID ], loader, images, connections );
					textureMap.set( parseInt( nodeID ), texture );

				}

			}

			return textureMap;

		}

		// Parse individual node in FBXTree.Objects.Texture
		function parseTexture( textureNode, loader, images, connections ) {

			var texture = loadTexture( textureNode, loader, images, connections );

			texture.ID = textureNode.id;

			texture.name = textureNode.attrName;

			var wrapModeU = textureNode.WrapModeU;
			var wrapModeV = textureNode.WrapModeV;

			var valueU = wrapModeU !== undefined ? wrapModeU.value : 0;
			var valueV = wrapModeV !== undefined ? wrapModeV.value : 0;

			// http://download.autodesk.com/us/fbx/SDKdocs/FBX_SDK_Help/files/fbxsdkref/class_k_fbx_texture.html#889640e63e2e681259ea81061b85143a
			// 0: repeat(default), 1: clamp

			texture.wrapS = valueU === 0 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
			texture.wrapT = valueV === 0 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

			if ( 'Scaling' in textureNode ) {

				var values = textureNode.Scaling.value;

				texture.repeat.x = values[ 0 ];
				texture.repeat.y = values[ 1 ];

			}

			return texture;

		}

		// load a texture specified as a blob or data URI, or via an external URL using THREE.TextureLoader
		function loadTexture( textureNode, loader, images, connections ) {

			var fileName;

			var currentPath = loader.path;

			var children = connections.get( textureNode.id ).children;

			if ( children !== undefined && children.length > 0 && images[ children[ 0 ].ID ] !== undefined ) {

				fileName = images[ children[ 0 ].ID ];

				if ( fileName.indexOf( 'blob:' ) === 0 || fileName.indexOf( 'data:' ) === 0 ) {

					loader.setPath( undefined );

				}

			}

			var texture = loader.load( fileName );

			loader.setPath( currentPath );

			return texture;

		}

		// Parse nodes in FBXTree.Objects.Material
		function parseMaterials( FBXTree, textureMap, connections ) {

			var materialMap = new Map();

			if ( 'Material' in FBXTree.Objects ) {

				var materialNodes = FBXTree.Objects.Material;

				for ( var nodeID in materialNodes ) {

					var material = parseMaterial( FBXTree, materialNodes[ nodeID ], textureMap, connections );

					if ( material !== null ) materialMap.set( parseInt( nodeID ), material );

				}

			}

			return materialMap;

		}

		// Parse single node in FBXTree.Objects.Material
		// Materials are connected to texture maps in FBXTree.Objects.Textures
		// FBX format currently only supports Lambert and Phong shading models
		function parseMaterial( FBXTree, materialNode, textureMap, connections ) {

			var ID = materialNode.id;
			var name = materialNode.attrName;
			var type = materialNode.ShadingModel;

			//Case where FBX wraps shading model in property object.
			if ( typeof type === 'object' ) {

				type = type.value;

			}

			// Ignore unused materials which don't have any connections.
			if ( ! connections.has( ID ) ) return null;

			var parameters = parseParameters( FBXTree, materialNode, textureMap, ID, connections );

			var material;

			switch ( type.toLowerCase() ) {

				case 'phong':
					material = new THREE.MeshPhongMaterial();
					break;
				case 'lambert':
					material = new THREE.MeshLambertMaterial();
					break;
				default:
					console.warn( 'THREE.FBXLoader: unknown material type "%s". Defaulting to MeshPhongMaterial.', type );
					material = new THREE.MeshPhongMaterial( { color: 0x3300ff } );
					break;

			}

			material.setValues( parameters );
			material.name = name;

			return material;

		}

		// Parse FBX material and return parameters suitable for a three.js material
		// Also parse the texture map and return any textures associated with the material
		function parseParameters( FBXTree, properties, textureMap, ID, connections ) {

			var parameters = {};

			if ( properties.BumpFactor ) {

				parameters.bumpScale = properties.BumpFactor.value;

			}
			if ( properties.Diffuse ) {

				parameters.color = new THREE.Color().fromArray( properties.Diffuse.value );

			}
			if ( properties.DisplacementFactor ) {

				parameters.displacementScale = properties.DisplacementFactor.value;

			}
			if ( properties.ReflectionFactor ) {

				parameters.reflectivity = properties.ReflectionFactor.value;

			}
			if ( properties.Specular ) {

				parameters.specular = new THREE.Color().fromArray( properties.Specular.value );

			}
			if ( properties.Shininess ) {

				parameters.shininess = properties.Shininess.value;

			}
			if ( properties.Emissive ) {

				parameters.emissive = new THREE.Color().fromArray( properties.Emissive.value );

			}
			if ( properties.EmissiveFactor ) {

				parameters.emissiveIntensity = parseFloat( properties.EmissiveFactor.value );

			}
			if ( properties.Opacity ) {

				parameters.opacity = parseFloat( properties.Opacity.value );

			}
			if ( parameters.opacity < 1.0 ) {

				parameters.transparent = true;

			}

			connections.get( ID ).children.forEach( function ( child ) {

				var type = child.relationship;

				switch ( type ) {

					case 'Bump':
						parameters.bumpMap = textureMap.get( child.ID );
						break;

					case 'DiffuseColor':
						parameters.map = getTexture( FBXTree, textureMap, child.ID, connections );
						break;

					case 'DisplacementColor':
						parameters.displacementMap = getTexture( FBXTree, textureMap, child.ID, connections );
						break;


					case 'EmissiveColor':
						parameters.emissiveMap = getTexture( FBXTree, textureMap, child.ID, connections );
						break;

					case 'NormalMap':
						parameters.normalMap = getTexture( FBXTree, textureMap, child.ID, connections );
						break;

					case 'ReflectionColor':
						parameters.envMap = getTexture( FBXTree, textureMap, child.ID, connections );
						parameters.envMap.mapping = THREE.EquirectangularReflectionMapping;
						break;

					case 'SpecularColor':
						parameters.specularMap = getTexture( FBXTree, textureMap, child.ID, connections );
						break;

					case 'TransparentColor':
						parameters.alphaMap = getTexture( FBXTree, textureMap, child.ID, connections );
						parameters.transparent = true;
						break;

					case 'AmbientColor':
					case 'ShininessExponent': // AKA glossiness map
					case 'SpecularFactor': // AKA specularLevel
					case 'VectorDisplacementColor': // NOTE: Seems to be a copy of DisplacementColor
					default:
						console.warn( 'THREE.FBXLoader: %s map is not supported in three.js, skipping texture.', type );
						break;

				}

			} );

			return parameters;

		}

		// get a texture from the textureMap for use by a material.
		function getTexture( FBXTree, textureMap, id, connections ) {

			// if the texture is a layered texture, just use the first layer and issue a warning
			if ( 'LayeredTexture' in FBXTree.Objects && id in FBXTree.Objects.LayeredTexture ) {

				console.warn( 'THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer.' );
				id = connections.get( id ).children[ 0 ].ID;

			}

			return textureMap.get( id );

		}

		// Parse nodes in FBXTree.Objects.Deformer
		// Deformer node can contain skinning or Vertex Cache animation data, however only skinning is supported here
		// Generates map of Skeleton-like objects for use later when generating and binding skeletons.
		function parseDeformers( FBXTree, connections ) {

			var skeletons = {};

			if ( 'Deformer' in FBXTree.Objects ) {

				var DeformerNodes = FBXTree.Objects.Deformer;

				for ( var nodeID in DeformerNodes ) {

					var deformerNode = DeformerNodes[ nodeID ];

					if ( deformerNode.attrType === 'Skin' ) {

						var relationships = connections.get( parseInt( nodeID ) );

						var skeleton = parseSkeleton( relationships, DeformerNodes );
						skeleton.ID = nodeID;

						if ( relationships.parents.length > 1 ) console.warn( 'THREE.FBXLoader: skeleton attached to more than one geometry is not supported.' );
						skeleton.geometryID = relationships.parents[ 0 ].ID;

						skeletons[ nodeID ] = skeleton;

					}

				}

			}

			return skeletons;

		}

		// Parse single nodes in FBXTree.Objects.Deformer
		// The top level deformer nodes have type 'Skin' and subDeformer nodes have type 'Cluster'
		// Each skin node represents a skeleton and each cluster node represents a bone
		function parseSkeleton( connections, deformerNodes ) {

			var rawBones = [];

			connections.children.forEach( function ( child ) {

				var subDeformerNode = deformerNodes[ child.ID ];

				if ( subDeformerNode.attrType !== 'Cluster' ) return;

				var rawBone = {

					ID: child.ID,
					indices: [],
					weights: [],
					transform: new THREE.Matrix4().fromArray( subDeformerNode.Transform.a ),
					transformLink: new THREE.Matrix4().fromArray( subDeformerNode.TransformLink.a ),
					linkMode: subDeformerNode.Mode,

				};

				if ( 'Indexes' in subDeformerNode ) {

					rawBone.indices = subDeformerNode.Indexes.a;
					rawBone.weights = subDeformerNode.Weights.a;

				}

				rawBones.push( rawBone );

			} );

			return {

				rawBones: rawBones,
				bones: []

			};

		}

		// Parse nodes in FBXTree.Objects.Geometry
		function parseGeometries( FBXTree, connections, skeletons ) {

			var geometryMap = new Map();

			if ( 'Geometry' in FBXTree.Objects ) {

				var geometryNodes = FBXTree.Objects.Geometry;



				for ( var nodeID in geometryNodes ) {

					var relationships = connections.get( parseInt( nodeID ) );
					var geo = parseGeometry( FBXTree, relationships, geometryNodes[ nodeID ], skeletons );

					geometryMap.set( parseInt( nodeID ), geo );

				}

			}

			return geometryMap;

		}

		// Parse single node in FBXTree.Objects.Geometry
		function parseGeometry( FBXTree, relationships, geometryNode, skeletons ) {

			switch ( geometryNode.attrType ) {

				case 'Mesh':
					return parseMeshGeometry( FBXTree, relationships, geometryNode, skeletons );
					break;

				case 'NurbsCurve':
					return parseNurbsGeometry( geometryNode );
					break;

			}

		}


		// Parse single node mesh geometry in FBXTree.Objects.Geometry
		function parseMeshGeometry( FBXTree, relationships, geometryNode, skeletons ) {

			var modelNodes = relationships.parents.map( function ( parent ) {

				return FBXTree.Objects.Model[ parent.ID ];

			} );

			// don't create geometry if it is not associated with any models
			if ( modelNodes.length === 0 ) return;

			var skeleton = relationships.children.reduce( function ( skeleton, child ) {

				if ( skeletons[ child.ID ] !== undefined ) skeleton = skeletons[ child.ID ];

				return skeleton;

			}, null );

			var preTransform = new THREE.Matrix4();

			// TODO: if there is more than one model associated with the geometry, AND the models have
			// different geometric transforms, then this will cause problems
			// if ( modelNodes.length > 1 ) { }

			// For now just assume one model and get the preRotations from that
			var modelNode = modelNodes[ 0 ];

			if ( 'GeometricRotation' in modelNode ) {

				var array = modelNode.GeometricRotation.value.map( THREE.Math.degToRad );
				array[ 3 ] = 'ZYX';

				preTransform.makeRotationFromEuler( new THREE.Euler().fromArray( array ) );

			}

			if ( 'GeometricTranslation' in modelNode ) {

				preTransform.setPosition( new THREE.Vector3().fromArray( modelNode.GeometricTranslation.value ) );

			}

			return genGeometry( FBXTree, relationships, geometryNode, skeleton, preTransform );

		}

		// Generate a THREE.BufferGeometry from a node in FBXTree.Objects.Geometry
		function genGeometry( FBXTree, relationships, geometryNode, skeleton, preTransform ) {

			var vertexPositions = geometryNode.Vertices.a;
			var vertexIndices = geometryNode.PolygonVertexIndex.a;

			// create arrays to hold the final data used to build the buffergeometry
			var vertexBuffer = [];
			var normalBuffer = [];
			var colorsBuffer = [];
			var uvsBuffer = [];
			var materialIndexBuffer = [];
			var vertexWeightsBuffer = [];
			var weightsIndicesBuffer = [];

			if ( geometryNode.LayerElementColor ) {

				var colorInfo = getColors( geometryNode.LayerElementColor[ 0 ] );

			}

			if ( geometryNode.LayerElementMaterial ) {

				var materialInfo = getMaterials( geometryNode.LayerElementMaterial[ 0 ] );

			}

			if ( geometryNode.LayerElementNormal ) {

				var normalInfo = getNormals( geometryNode.LayerElementNormal[ 0 ] );

			}

			if ( geometryNode.LayerElementUV ) {

				var uvInfo = [];
				var i = 0;
				while ( geometryNode.LayerElementUV[ i ] ) {

					uvInfo.push( getUVs( geometryNode.LayerElementUV[ i ] ) );
					i ++;

				}

			}

			var weightTable = {};

			if ( skeleton !== null ) {

				skeleton.rawBones.forEach( function ( rawBone, i ) {

					// loop over the bone's vertex indices and weights
					rawBone.indices.forEach( function ( index, j ) {

						if ( weightTable[ index ] === undefined ) weightTable[ index ] = [];

						weightTable[ index ].push( {

							id: i,
							weight: rawBone.weights[ j ],

						} );

					} );

				} );

			}

			var polygonIndex = 0;
			var faceLength = 0;
			var displayedWeightsWarning = false;

			// these will hold data for a single face
			var vertexPositionIndexes = [];
			var faceNormals = [];
			var faceColors = [];
			var faceUVs = [];
			var faceWeights = [];
			var faceWeightIndices = [];

			vertexIndices.forEach( function ( vertexIndex, polygonVertexIndex ) {

				var endOfFace = false;

				// Face index and vertex index arrays are combined in a single array
				// A cube with quad faces looks like this:
				// PolygonVertexIndex: *24 {
				//  a: 0, 1, 3, -3, 2, 3, 5, -5, 4, 5, 7, -7, 6, 7, 1, -1, 1, 7, 5, -4, 6, 0, 2, -5
				//  }
				// Negative numbers mark the end of a face - first face here is 0, 1, 3, -3
				// to find index of last vertex multiply by -1 and subtract 1: -3 * - 1 - 1 = 2
				if ( vertexIndex < 0 ) {

					vertexIndex = vertexIndex ^ - 1; // equivalent to ( x * -1 ) - 1
					vertexIndices[ polygonVertexIndex ] = vertexIndex;
					endOfFace = true;

				}

				var weightIndices = [];
				var weights = [];

				vertexPositionIndexes.push( vertexIndex * 3, vertexIndex * 3 + 1, vertexIndex * 3 + 2 );

				if ( colorInfo ) {

					var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, colorInfo );

					faceColors.push( data[ 0 ], data[ 1 ], data[ 2 ] );

				}

				if ( skeleton ) {

					if ( weightTable[ vertexIndex ] !== undefined ) {

						weightTable[ vertexIndex ].forEach( function ( wt ) {

							weights.push( wt.weight );
							weightIndices.push( wt.id );

						} );


					}

					if ( weights.length > 4 ) {

						if ( ! displayedWeightsWarning ) {

							console.warn( 'THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights.' );
							displayedWeightsWarning = true;

						}

						var wIndex = [ 0, 0, 0, 0 ];
						var Weight = [ 0, 0, 0, 0 ];

						weights.forEach( function ( weight, weightIndex ) {

							var currentWeight = weight;
							var currentIndex = weightIndices[ weightIndex ];

							Weight.forEach( function ( comparedWeight, comparedWeightIndex, comparedWeightArray ) {

								if ( currentWeight > comparedWeight ) {

									comparedWeightArray[ comparedWeightIndex ] = currentWeight;
									currentWeight = comparedWeight;

									var tmp = wIndex[ comparedWeightIndex ];
									wIndex[ comparedWeightIndex ] = currentIndex;
									currentIndex = tmp;

								}

							} );

						} );

						weightIndices = wIndex;
						weights = Weight;

					}

					// if the weight array is shorter than 4 pad with 0s
					while ( weights.length < 4 ) {

						weights.push( 0 );
						weightIndices.push( 0 );

					}

					for ( var i = 0; i < 4; ++ i ) {

						faceWeights.push( weights[ i ] );
						faceWeightIndices.push( weightIndices[ i ] );

					}

				}

				if ( normalInfo ) {

					var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, normalInfo );

					faceNormals.push( data[ 0 ], data[ 1 ], data[ 2 ] );

				}

				if ( materialInfo && materialInfo.mappingType !== 'AllSame' ) {

					var materialIndex = getData( polygonVertexIndex, polygonIndex, vertexIndex, materialInfo )[ 0 ];

				}

				if ( uvInfo ) {

					uvInfo.forEach( function ( uv, i ) {

						var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, uv );

						if ( faceUVs[ i ] === undefined ) {

							faceUVs[ i ] = [];

						}

						faceUVs[ i ].push( data[ 0 ] );
						faceUVs[ i ].push( data[ 1 ] );

					} );

				}

				faceLength ++;

				// we have reached the end of a face - it may have 4 sides though
				// in which case the data is split to represent two 3 sided faces
				if ( endOfFace ) {

					for ( var i = 2; i < faceLength; i ++ ) {

						vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ 0 ] ] );
						vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ 1 ] ] );
						vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ 2 ] ] );

						vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ ( i - 1 ) * 3 ] ] );
						vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ ( i - 1 ) * 3 + 1 ] ] );
						vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ ( i - 1 ) * 3 + 2 ] ] );

						vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ i * 3 ] ] );
						vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ i * 3 + 1 ] ] );
						vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ i * 3 + 2 ] ] );

						if ( skeleton ) {

							vertexWeightsBuffer.push( faceWeights[ 0 ] );
							vertexWeightsBuffer.push( faceWeights[ 1 ] );
							vertexWeightsBuffer.push( faceWeights[ 2 ] );
							vertexWeightsBuffer.push( faceWeights[ 3 ] );

							vertexWeightsBuffer.push( faceWeights[ ( i - 1 ) * 4 ] );
							vertexWeightsBuffer.push( faceWeights[ ( i - 1 ) * 4 + 1 ] );
							vertexWeightsBuffer.push( faceWeights[ ( i - 1 ) * 4 + 2 ] );
							vertexWeightsBuffer.push( faceWeights[ ( i - 1 ) * 4 + 3 ] );

							vertexWeightsBuffer.push( faceWeights[ i * 4 ] );
							vertexWeightsBuffer.push( faceWeights[ i * 4 + 1 ] );
							vertexWeightsBuffer.push( faceWeights[ i * 4 + 2 ] );
							vertexWeightsBuffer.push( faceWeights[ i * 4 + 3 ] );

							weightsIndicesBuffer.push( faceWeightIndices[ 0 ] );
							weightsIndicesBuffer.push( faceWeightIndices[ 1 ] );
							weightsIndicesBuffer.push( faceWeightIndices[ 2 ] );
							weightsIndicesBuffer.push( faceWeightIndices[ 3 ] );

							weightsIndicesBuffer.push( faceWeightIndices[ ( i - 1 ) * 4 ] );
							weightsIndicesBuffer.push( faceWeightIndices[ ( i - 1 ) * 4 + 1 ] );
							weightsIndicesBuffer.push( faceWeightIndices[ ( i - 1 ) * 4 + 2 ] );
							weightsIndicesBuffer.push( faceWeightIndices[ ( i - 1 ) * 4 + 3 ] );

							weightsIndicesBuffer.push( faceWeightIndices[ i * 4 ] );
							weightsIndicesBuffer.push( faceWeightIndices[ i * 4 + 1 ] );
							weightsIndicesBuffer.push( faceWeightIndices[ i * 4 + 2 ] );
							weightsIndicesBuffer.push( faceWeightIndices[ i * 4 + 3 ] );

						}

						if ( colorInfo ) {

							colorsBuffer.push( faceColors[ 0 ] );
							colorsBuffer.push( faceColors[ 1 ] );
							colorsBuffer.push( faceColors[ 2 ] );

							colorsBuffer.push( faceColors[ ( i - 1 ) * 3 ] );
							colorsBuffer.push( faceColors[ ( i - 1 ) * 3 + 1 ] );
							colorsBuffer.push( faceColors[ ( i - 1 ) * 3 + 2 ] );

							colorsBuffer.push( faceColors[ i * 3 ] );
							colorsBuffer.push( faceColors[ i * 3 + 1 ] );
							colorsBuffer.push( faceColors[ i * 3 + 2 ] );

						}

						if ( materialInfo && materialInfo.mappingType !== 'AllSame' ) {

							materialIndexBuffer.push( materialIndex );
							materialIndexBuffer.push( materialIndex );
							materialIndexBuffer.push( materialIndex );

						}

						if ( normalInfo ) {

							normalBuffer.push( faceNormals[ 0 ] );
							normalBuffer.push( faceNormals[ 1 ] );
							normalBuffer.push( faceNormals[ 2 ] );

							normalBuffer.push( faceNormals[ ( i - 1 ) * 3 ] );
							normalBuffer.push( faceNormals[ ( i - 1 ) * 3 + 1 ] );
							normalBuffer.push( faceNormals[ ( i - 1 ) * 3 + 2 ] );

							normalBuffer.push( faceNormals[ i * 3 ] );
							normalBuffer.push( faceNormals[ i * 3 + 1 ] );
							normalBuffer.push( faceNormals[ i * 3 + 2 ] );

						}

						if ( uvInfo ) {

							uvInfo.forEach( function ( uv, j ) {

								if ( uvsBuffer[ j ] === undefined ) uvsBuffer[ j ] = [];

								uvsBuffer[ j ].push( faceUVs[ j ][ 0 ] );
								uvsBuffer[ j ].push( faceUVs[ j ][ 1 ] );

								uvsBuffer[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 ] );
								uvsBuffer[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 + 1 ] );

								uvsBuffer[ j ].push( faceUVs[ j ][ i * 2 ] );
								uvsBuffer[ j ].push( faceUVs[ j ][ i * 2 + 1 ] );

							} );

						}

					}

					polygonIndex ++;
					faceLength = 0;

					// reset arrays for the next face
					vertexPositionIndexes = [];
					faceNormals = [];
					faceColors = [];
					faceUVs = [];
					faceWeights = [];
					faceWeightIndices = [];

				}

			} );

			var geo = new THREE.BufferGeometry();
			geo.name = geometryNode.name;

			var positionAttribute = new THREE.Float32BufferAttribute( vertexBuffer, 3 );

			preTransform.applyToBufferAttribute( positionAttribute );

			geo.addAttribute( 'position', positionAttribute );

			if ( colorsBuffer.length > 0 ) {

				geo.addAttribute( 'color', new THREE.Float32BufferAttribute( colorsBuffer, 3 ) );

			}

			if ( skeleton ) {

				geo.addAttribute( 'skinIndex', new THREE.Float32BufferAttribute( weightsIndicesBuffer, 4 ) );

				geo.addAttribute( 'skinWeight', new THREE.Float32BufferAttribute( vertexWeightsBuffer, 4 ) );

				// used later to bind the skeleton to the model
				geo.FBX_Deformer = skeleton;

			}

			if ( normalBuffer.length > 0 ) {

				var normalAttribute = new THREE.Float32BufferAttribute( normalBuffer, 3 );

				var normalMatrix = new THREE.Matrix3().getNormalMatrix( preTransform );
				normalMatrix.applyToBufferAttribute( normalAttribute );

				geo.addAttribute( 'normal', normalAttribute );

			}

			uvsBuffer.forEach( function ( uvBuffer, i ) {

				// subsequent uv buffers are called 'uv1', 'uv2', ...
				var name = 'uv' + ( i + 1 ).toString();

				// the first uv buffer is just called 'uv'
				if ( i === 0 ) {

					name = 'uv';

				}

				geo.addAttribute( name, new THREE.Float32BufferAttribute( uvsBuffer[ i ], 2 ) );

			} );

			if ( materialInfo && materialInfo.mappingType !== 'AllSame' ) {

				// Convert the material indices of each vertex into rendering groups on the geometry.
				var prevMaterialIndex = materialIndexBuffer[ 0 ];
				var startIndex = 0;

				materialIndexBuffer.forEach( function ( currentIndex, i ) {

					if ( currentIndex !== prevMaterialIndex ) {

						geo.addGroup( startIndex, i - startIndex, prevMaterialIndex );

						prevMaterialIndex = currentIndex;
						startIndex = i;

					}

				} );

				// the loop above doesn't add the last group, do that here.
				if ( geo.groups.length > 0 ) {

					var lastGroup = geo.groups[ geo.groups.length - 1 ];
					var lastIndex = lastGroup.start + lastGroup.count;

					if ( lastIndex !== materialIndexBuffer.length ) {

						geo.addGroup( lastIndex, materialIndexBuffer.length - lastIndex, prevMaterialIndex );

					}

				}

				// case where there are multiple materials but the whole geometry is only
				// using one of them
				if ( geo.groups.length === 0 ) {

					geo.addGroup( 0, materialIndexBuffer.length, materialIndexBuffer[ 0 ] );

				}

			}

			return geo;

		}


		// Parse normal from FBXTree.Objects.Geometry.LayerElementNormal if it exists
		function getNormals( NormalNode ) {

			var mappingType = NormalNode.MappingInformationType;
			var referenceType = NormalNode.ReferenceInformationType;
			var buffer = NormalNode.Normals.a;
			var indexBuffer = [];
			if ( referenceType === 'IndexToDirect' ) {

				if ( 'NormalIndex' in NormalNode ) {

					indexBuffer = NormalNode.NormalIndex.a;

				} else if ( 'NormalsIndex' in NormalNode ) {

					indexBuffer = NormalNode.NormalsIndex.a;

				}

			}

			return {
				dataSize: 3,
				buffer: buffer,
				indices: indexBuffer,
				mappingType: mappingType,
				referenceType: referenceType
			};

		}

		// Parse UVs from FBXTree.Objects.Geometry.LayerElementUV if it exists
		function getUVs( UVNode ) {

			var mappingType = UVNode.MappingInformationType;
			var referenceType = UVNode.ReferenceInformationType;
			var buffer = UVNode.UV.a;
			var indexBuffer = [];
			if ( referenceType === 'IndexToDirect' ) {

				indexBuffer = UVNode.UVIndex.a;

			}

			return {
				dataSize: 2,
				buffer: buffer,
				indices: indexBuffer,
				mappingType: mappingType,
				referenceType: referenceType
			};

		}

		// Parse Vertex Colors from FBXTree.Objects.Geometry.LayerElementColor if it exists
		function getColors( ColorNode ) {

			var mappingType = ColorNode.MappingInformationType;
			var referenceType = ColorNode.ReferenceInformationType;
			var buffer = ColorNode.Colors.a;
			var indexBuffer = [];
			if ( referenceType === 'IndexToDirect' ) {

				indexBuffer = ColorNode.ColorIndex.a;

			}

			return {
				dataSize: 4,
				buffer: buffer,
				indices: indexBuffer,
				mappingType: mappingType,
				referenceType: referenceType
			};

		}

		// Parse mapping and material data in FBXTree.Objects.Geometry.LayerElementMaterial if it exists
		function getMaterials( MaterialNode ) {

			var mappingType = MaterialNode.MappingInformationType;
			var referenceType = MaterialNode.ReferenceInformationType;

			if ( mappingType === 'NoMappingInformation' ) {

				return {
					dataSize: 1,
					buffer: [ 0 ],
					indices: [ 0 ],
					mappingType: 'AllSame',
					referenceType: referenceType
				};

			}

			var materialIndexBuffer = MaterialNode.Materials.a;

			// Since materials are stored as indices, there's a bit of a mismatch between FBX and what
			// we expect.So we create an intermediate buffer that points to the index in the buffer,
			// for conforming with the other functions we've written for other data.
			var materialIndices = [];

			for ( var i = 0; i < materialIndexBuffer.length; ++ i ) {

				materialIndices.push( i );

			}

			return {
				dataSize: 1,
				buffer: materialIndexBuffer,
				indices: materialIndices,
				mappingType: mappingType,
				referenceType: referenceType
			};

		}

		// Functions use the infoObject and given indices to return value array of geometry.
		// Parameters:
		// 	- polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
		// 	- polygonIndex - Index of polygon in geometry.
		// 	- vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
		// 	- infoObject: can be materialInfo, normalInfo, UVInfo or colorInfo
		// Index type:
		//	- Direct: index is same as polygonVertexIndex
		//	- IndexToDirect: infoObject has it's own set of indices
		var dataArray = [];

		var GetData = {

			ByPolygonVertex: {

				Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

					var from = ( polygonVertexIndex * infoObject.dataSize );
					var to = ( polygonVertexIndex * infoObject.dataSize ) + infoObject.dataSize;

					return slice( dataArray, infoObject.buffer, from, to );

				},

				IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

					var index = infoObject.indices[ polygonVertexIndex ];
					var from = ( index * infoObject.dataSize );
					var to = ( index * infoObject.dataSize ) + infoObject.dataSize;

					return slice( dataArray, infoObject.buffer, from, to );

				}

			},

			ByPolygon: {

				Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

					var from = polygonIndex * infoObject.dataSize;
					var to = polygonIndex * infoObject.dataSize + infoObject.dataSize;

					return slice( dataArray, infoObject.buffer, from, to );

				},

				IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

					var index = infoObject.indices[ polygonIndex ];
					var from = index * infoObject.dataSize;
					var to = index * infoObject.dataSize + infoObject.dataSize;

					return slice( dataArray, infoObject.buffer, from, to );

				}

			},

			ByVertice: {

				Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

					var from = ( vertexIndex * infoObject.dataSize );
					var to = ( vertexIndex * infoObject.dataSize ) + infoObject.dataSize;

					return slice( dataArray, infoObject.buffer, from, to );

				}

			},

			AllSame: {

				IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

					var from = infoObject.indices[ 0 ] * infoObject.dataSize;
					var to = infoObject.indices[ 0 ] * infoObject.dataSize + infoObject.dataSize;

					return slice( dataArray, infoObject.buffer, from, to );

				}

			}

		};

		function getData( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

			return GetData[ infoObject.mappingType ][ infoObject.referenceType ]( polygonVertexIndex, polygonIndex, vertexIndex, infoObject );

		}

		// Generate a NurbGeometry from a node in FBXTree.Objects.Geometry
		function parseNurbsGeometry( geometryNode ) {

			if ( THREE.NURBSCurve === undefined ) {

				console.error( 'THREE.FBXLoader: The loader relies on THREE.NURBSCurve for any nurbs present in the model. Nurbs will show up as empty geometry.' );
				return new THREE.BufferGeometry();

			}

			var order = parseInt( geometryNode.Order );

			if ( isNaN( order ) ) {

				console.error( 'THREE.FBXLoader: Invalid Order %s given for geometry ID: %s', geometryNode.Order, geometryNode.id );
				return new THREE.BufferGeometry();

			}

			var degree = order - 1;

			var knots = geometryNode.KnotVector.a;
			var controlPoints = [];
			var pointsValues = geometryNode.Points.a;

			for ( var i = 0, l = pointsValues.length; i < l; i += 4 ) {

				controlPoints.push( new THREE.Vector4().fromArray( pointsValues, i ) );

			}

			var startKnot, endKnot;

			if ( geometryNode.Form === 'Closed' ) {

				controlPoints.push( controlPoints[ 0 ] );

			} else if ( geometryNode.Form === 'Periodic' ) {

				startKnot = degree;
				endKnot = knots.length - 1 - startKnot;

				for ( var i = 0; i < degree; ++ i ) {

					controlPoints.push( controlPoints[ i ] );

				}

			}

			var curve = new THREE.NURBSCurve( degree, knots, controlPoints, startKnot, endKnot );
			var vertices = curve.getPoints( controlPoints.length * 7 );

			var positions = new Float32Array( vertices.length * 3 );

			vertices.forEach( function ( vertex, i ) {

				vertex.toArray( positions, i * 3 );

			} );

			var geometry = new THREE.BufferGeometry();
			geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

			return geometry;

		}

		// create the main THREE.Group() to be returned by the loader
		function parseScene( FBXTree, connections, skeletons, geometryMap, materialMap ) {

			var sceneGraph = new THREE.Group();

			var modelMap = parseModels( FBXTree, skeletons, geometryMap, materialMap, connections );

			var modelNodes = FBXTree.Objects.Model;

			modelMap.forEach( function ( model ) {

				var modelNode = modelNodes[ model.ID ];
				setLookAtProperties( FBXTree, model, modelNode, connections, sceneGraph );

				var parentConnections = connections.get( model.ID ).parents;

				parentConnections.forEach( function ( connection ) {

					var parent = modelMap.get( connection.ID );
					if ( parent !== undefined ) parent.add( model );

				} );

				if ( model.parent === null ) {

					sceneGraph.add( model );

				}


			} );

			bindSkeleton( FBXTree, skeletons, geometryMap, modelMap, connections );

			addAnimations( FBXTree, connections, sceneGraph );

			createAmbientLight( FBXTree, sceneGraph );

			return sceneGraph;

		}

		// parse nodes in FBXTree.Objects.Model
		function parseModels( FBXTree, skeletons, geometryMap, materialMap, connections ) {

			var modelMap = new Map();
			var modelNodes = FBXTree.Objects.Model;

			for ( var nodeID in modelNodes ) {

				var id = parseInt( nodeID );
				var node = modelNodes[ nodeID ];
				var relationships = connections.get( id );

				var model = buildSkeleton( relationships, skeletons, id, node.attrName );

				if ( ! model ) {

					switch ( node.attrType ) {

						case 'Camera':
							model = createCamera( FBXTree, relationships );
							break;
						case 'Light':
							model = createLight( FBXTree, relationships );
							break;
						case 'Mesh':
							model = createMesh( FBXTree, relationships, geometryMap, materialMap );
							break;
						case 'NurbsCurve':
							model = createCurve( relationships, geometryMap );
							break;
						case 'LimbNode': // usually associated with a Bone, however if a Bone was not created we'll make a Group instead
						case 'Null':
						default:
							model = new THREE.Group();
							break;

					}

					model.name = THREE.PropertyBinding.sanitizeNodeName( node.attrName );
					model.ID = id;

				}

				setModelTransforms( FBXTree, model, node );
				modelMap.set( id, model );

			}

			return modelMap;

		}

		function buildSkeleton( relationships, skeletons, id, name ) {

			var bone = null;

			relationships.parents.forEach( function ( parent ) {

				for ( var ID in skeletons ) {

					var skeleton = skeletons[ ID ];

					skeleton.rawBones.forEach( function ( rawBone, i ) {

						if ( rawBone.ID === parent.ID ) {

							var subBone = bone;
							bone = new THREE.Bone();
							bone.matrixWorld.copy( rawBone.transformLink );

							// set name and id here - otherwise in cases where "subBone" is created it will not have a name / id
							bone.name = THREE.PropertyBinding.sanitizeNodeName( name );
							bone.ID = id;

							skeleton.bones[ i ] = bone;

							// In cases where a bone is shared between multiple meshes
							// duplicate the bone here and and it as a child of the first bone
							if ( subBone !== null ) {

								bone.add( subBone );

							}

						}

					} );

				}

			} );

			return bone;

		}

		// create a THREE.PerspectiveCamera or THREE.OrthographicCamera
		function createCamera( FBXTree, relationships ) {

			var model;
			var cameraAttribute;

			relationships.children.forEach( function ( child ) {

				var attr = FBXTree.Objects.NodeAttribute[ child.ID ];

				if ( attr !== undefined ) {

					cameraAttribute = attr;

				}

			} );

			if ( cameraAttribute === undefined ) {

				model = new THREE.Object3D();

			} else {

				var type = 0;
				if ( cameraAttribute.CameraProjectionType !== undefined && cameraAttribute.CameraProjectionType.value === 1 ) {

					type = 1;

				}

				var nearClippingPlane = 1;
				if ( cameraAttribute.NearPlane !== undefined ) {

					nearClippingPlane = cameraAttribute.NearPlane.value / 1000;

				}

				var farClippingPlane = 1000;
				if ( cameraAttribute.FarPlane !== undefined ) {

					farClippingPlane = cameraAttribute.FarPlane.value / 1000;

				}


				var width = window.innerWidth;
				var height = window.innerHeight;

				if ( cameraAttribute.AspectWidth !== undefined && cameraAttribute.AspectHeight !== undefined ) {

					width = cameraAttribute.AspectWidth.value;
					height = cameraAttribute.AspectHeight.value;

				}

				var aspect = width / height;

				var fov = 45;
				if ( cameraAttribute.FieldOfView !== undefined ) {

					fov = cameraAttribute.FieldOfView.value;

				}

				var focalLength = cameraAttribute.FocalLength ? cameraAttribute.FocalLength.value : null;

				switch ( type ) {

					case 0: // Perspective
						model = new THREE.PerspectiveCamera( fov, aspect, nearClippingPlane, farClippingPlane );
						if ( focalLength !== null ) model.setFocalLength( focalLength );
						break;

					case 1: // Orthographic
						model = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, nearClippingPlane, farClippingPlane );
						break;

					default:
						console.warn( 'THREE.FBXLoader: Unknown camera type ' + type + '.' );
						model = new THREE.Object3D();
						break;

				}

			}

			return model;

		}

		// Create a THREE.DirectionalLight, THREE.PointLight or THREE.SpotLight
		function createLight( FBXTree, relationships ) {

			var model;
			var lightAttribute;

			relationships.children.forEach( function ( child ) {

				var attr = FBXTree.Objects.NodeAttribute[ child.ID ];

				if ( attr !== undefined ) {

					lightAttribute = attr;

				}

			} );

			if ( lightAttribute === undefined ) {

				model = new THREE.Object3D();

			} else {

				var type;

				// LightType can be undefined for Point lights
				if ( lightAttribute.LightType === undefined ) {

					type = 0;

				} else {

					type = lightAttribute.LightType.value;

				}

				var color = 0xffffff;

				if ( lightAttribute.Color !== undefined ) {

					color = new THREE.Color().fromArray( lightAttribute.Color.value );

				}

				var intensity = ( lightAttribute.Intensity === undefined ) ? 1 : lightAttribute.Intensity.value / 100;

				// light disabled
				if ( lightAttribute.CastLightOnObject !== undefined && lightAttribute.CastLightOnObject.value === 0 ) {

					intensity = 0;

				}

				var distance = 0;
				if ( lightAttribute.FarAttenuationEnd !== undefined ) {

					if ( lightAttribute.EnableFarAttenuation !== undefined && lightAttribute.EnableFarAttenuation.value === 0 ) {

						distance = 0;

					} else {

						distance = lightAttribute.FarAttenuationEnd.value / 1000;

					}

				}

				// TODO: could this be calculated linearly from FarAttenuationStart to FarAttenuationEnd?
				var decay = 1;

				switch ( type ) {

					case 0: // Point
						model = new THREE.PointLight( color, intensity, distance, decay );
						break;

					case 1: // Directional
						model = new THREE.DirectionalLight( color, intensity );
						break;

					case 2: // Spot
						var angle = Math.PI / 3;

						if ( lightAttribute.InnerAngle !== undefined ) {

							angle = THREE.Math.degToRad( lightAttribute.InnerAngle.value );

						}

						var penumbra = 0;
						if ( lightAttribute.OuterAngle !== undefined ) {

							// TODO: this is not correct - FBX calculates outer and inner angle in degrees
							// with OuterAngle > InnerAngle && OuterAngle <= Math.PI
							// while three.js uses a penumbra between (0, 1) to attenuate the inner angle
							penumbra = THREE.Math.degToRad( lightAttribute.OuterAngle.value );
							penumbra = Math.max( penumbra, 1 );

						}

						model = new THREE.SpotLight( color, intensity, distance, angle, penumbra, decay );
						break;

					default:
						console.warn( 'THREE.FBXLoader: Unknown light type ' + lightAttribute.LightType.value + ', defaulting to a THREE.PointLight.' );
						model = new THREE.PointLight( color, intensity );
						break;

				}

				if ( lightAttribute.CastShadows !== undefined && lightAttribute.CastShadows.value === 1 ) {

					model.castShadow = true;

				}

			}

			return model;

		}

		function createMesh( FBXTree, relationships, geometryMap, materialMap ) {

			var model;
			var geometry = null;
			var material = null;
			var materials = [];

			// get geometry and materials(s) from connections
			relationships.children.forEach( function ( child ) {

				if ( geometryMap.has( child.ID ) ) {

					geometry = geometryMap.get( child.ID );

				}

				if ( materialMap.has( child.ID ) ) {

					materials.push( materialMap.get( child.ID ) );

				}

			} );

			if ( materials.length > 1 ) {

				material = materials;

			} else if ( materials.length > 0 ) {

				material = materials[ 0 ];

			} else {

				material = new THREE.MeshPhongMaterial( { color: 0xcccccc } );
				materials.push( material );

			}

			if ( 'color' in geometry.attributes ) {

				materials.forEach( function ( material ) {

					material.vertexColors = THREE.VertexColors;

				} );

			}

			if ( geometry.FBX_Deformer ) {

				materials.forEach( function ( material ) {

					material.skinning = true;

				} );

				model = new THREE.SkinnedMesh( geometry, material );

			} else {

				model = new THREE.Mesh( geometry, material );

			}

			return model;

		}

		function createCurve( relationships, geometryMap ) {

			var geometry = relationships.children.reduce( function ( geo, child ) {

				if ( geometryMap.has( child.ID ) ) geo = geometryMap.get( child.ID );

				return geo;

			}, null );

			// FBX does not list materials for Nurbs lines, so we'll just put our own in here.
			var material = new THREE.LineBasicMaterial( { color: 0x3300ff, linewidth: 1 } );
			return new THREE.Line( geometry, material );

		}

		// Parse ambient color in FBXTree.GlobalSettings - if it's not set to black (default), create an ambient light
		function createAmbientLight( FBXTree, sceneGraph ) {

			if ( 'GlobalSettings' in FBXTree && 'AmbientColor' in FBXTree.GlobalSettings ) {

				var ambientColor = FBXTree.GlobalSettings.AmbientColor.value;
				var r = ambientColor[ 0 ];
				var g = ambientColor[ 1 ];
				var b = ambientColor[ 2 ];

				if ( r !== 0 || g !== 0 || b !== 0 ) {

					var color = new THREE.Color( r, g, b );
					sceneGraph.add( new THREE.AmbientLight( color, 1 ) );

				}

			}

		}

		function setLookAtProperties( FBXTree, model, modelNode, connections, sceneGraph ) {

			if ( 'LookAtProperty' in modelNode ) {

				var children = connections.get( model.ID ).children;

				children.forEach( function ( child ) {

					if ( child.relationship === 'LookAtProperty' ) {

						var lookAtTarget = FBXTree.Objects.Model[ child.ID ];

						if ( 'Lcl_Translation' in lookAtTarget ) {

							var pos = lookAtTarget.Lcl_Translation.value;

							// DirectionalLight, SpotLight
							if ( model.target !== undefined ) {

								model.target.position.fromArray( pos );
								sceneGraph.add( model.target );

							} else { // Cameras and other Object3Ds

								model.lookAt( new THREE.Vector3().fromArray( pos ) );

							}

						}

					}

				} );

			}

		}

		// parse the model node for transform details and apply them to the model
		function setModelTransforms( FBXTree, model, modelNode ) {

			// http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_class_fbx_euler_html
			if ( 'RotationOrder' in modelNode ) {

				var enums = [
					'XYZ', // default
					'XZY',
					'YZX',
					'ZXY',
					'YXZ',
					'ZYX',
					'SphericXYZ',
				];

				var value = parseInt( modelNode.RotationOrder.value, 10 );

				if ( value > 0 && value < 6 ) {

					// model.rotation.order = enums[ value ];

					// Note: Euler order other than XYZ is currently not supported, so just display a warning for now
					console.warn( 'THREE.FBXLoader: unsupported Euler Order: %s. Currently only XYZ order is supported. Animations and rotations may be incorrect.', enums[ value ] );

				} else if ( value === 6 ) {

					console.warn( 'THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect.' );

				}

			}

			if ( 'Lcl_Translation' in modelNode ) {

				model.position.fromArray( modelNode.Lcl_Translation.value );

			}

			if ( 'Lcl_Rotation' in modelNode ) {

				var rotation = modelNode.Lcl_Rotation.value.map( THREE.Math.degToRad );
				rotation.push( 'ZYX' );
				model.rotation.fromArray( rotation );

			}

			if ( 'Lcl_Scaling' in modelNode ) {

				model.scale.fromArray( modelNode.Lcl_Scaling.value );

			}

			if ( 'PreRotation' in modelNode ) {

				var array = modelNode.PreRotation.value.map( THREE.Math.degToRad );
				array[ 3 ] = 'ZYX';

				var preRotations = new THREE.Euler().fromArray( array );

				preRotations = new THREE.Quaternion().setFromEuler( preRotations );
				var currentRotation = new THREE.Quaternion().setFromEuler( model.rotation );
				preRotations.multiply( currentRotation );
				model.rotation.setFromQuaternion( preRotations, 'ZYX' );

			}

		}

		function bindSkeleton( FBXTree, skeletons, geometryMap, modelMap, connections ) {

			var bindMatrices = parsePoseNodes( FBXTree );

			for ( var ID in skeletons ) {

				var skeleton = skeletons[ ID ];

				var parents = connections.get( parseInt( skeleton.ID ) ).parents;

				parents.forEach( function ( parent ) {

					if ( geometryMap.has( parent.ID ) ) {

						var geoID = parent.ID;
						var geoRelationships = connections.get( geoID );

						geoRelationships.parents.forEach( function ( geoConnParent ) {

							if ( modelMap.has( geoConnParent.ID ) ) {

								var model = modelMap.get( geoConnParent.ID );

								model.bind( new THREE.Skeleton( skeleton.bones ), bindMatrices[ geoConnParent.ID ] );

							}

						} );

					}

				} );

			}

		}

		function parsePoseNodes( FBXTree ) {

			var bindMatrices = {};

			if ( 'Pose' in FBXTree.Objects ) {

				var BindPoseNode = FBXTree.Objects.Pose;

				for ( var nodeID in BindPoseNode ) {

					if ( BindPoseNode[ nodeID ].attrType === 'BindPose' ) {

						var poseNodes = BindPoseNode[ nodeID ].PoseNode;

						if ( Array.isArray( poseNodes ) ) {

							poseNodes.forEach( function ( poseNode ) {

								bindMatrices[ poseNode.Node ] = new THREE.Matrix4().fromArray( poseNode.Matrix.a );

							} );

						} else {

							bindMatrices[ poseNodes.Node ] = new THREE.Matrix4().fromArray( poseNodes.Matrix.a );

						}

					}

				}

			}

			return bindMatrices;

		}

		function parseAnimations( FBXTree, connections ) {

			// since the actual transformation data is stored in FBXTree.Objects.AnimationCurve,
			// if this is undefined we can safely assume there are no animations
			if ( FBXTree.Objects.AnimationCurve === undefined ) return undefined;

			var curveNodesMap = parseAnimationCurveNodes( FBXTree );

			parseAnimationCurves( FBXTree, connections, curveNodesMap );

			var layersMap = parseAnimationLayers( FBXTree, connections, curveNodesMap );
			var rawClips = parseAnimStacks( FBXTree, connections, layersMap );

			return rawClips;

		}

		// parse nodes in FBXTree.Objects.AnimationCurveNode
		// each AnimationCurveNode holds data for an animation transform for a model (e.g. left arm rotation )
		// and is referenced by an AnimationLayer
		function parseAnimationCurveNodes( FBXTree ) {

			var rawCurveNodes = FBXTree.Objects.AnimationCurveNode;

			var curveNodesMap = new Map();

			for ( var nodeID in rawCurveNodes ) {

				var rawCurveNode = rawCurveNodes[ nodeID ];

				if ( rawCurveNode.attrName.match( /S|R|T/ ) !== null ) {

					var curveNode = {

						id: rawCurveNode.id,
						attr: rawCurveNode.attrName,
						curves: {},

					};

					curveNodesMap.set( curveNode.id, curveNode );

				}

			}

			return curveNodesMap;

		}

		// parse nodes in FBXTree.Objects.AnimationCurve and connect them up to
		// previously parsed AnimationCurveNodes. Each AnimationCurve holds data for a single animated
		// axis ( e.g. times and values of x rotation)
		function parseAnimationCurves( FBXTree, connections, curveNodesMap ) {

			var rawCurves = FBXTree.Objects.AnimationCurve;

			for ( var nodeID in rawCurves ) {

				var animationCurve = {

					id: rawCurves[ nodeID ].id,
					times: rawCurves[ nodeID ].KeyTime.a.map( convertFBXTimeToSeconds ),
					values: rawCurves[ nodeID ].KeyValueFloat.a,

				};

				var relationships = connections.get( animationCurve.id );

				if ( relationships !== undefined ) {

					var animationCurveID = relationships.parents[ 0 ].ID;
					var animationCurveRelationship = relationships.parents[ 0 ].relationship;
					var axis = '';

					if ( animationCurveRelationship.match( /X/ ) ) {

						axis = 'x';

					} else if ( animationCurveRelationship.match( /Y/ ) ) {

						axis = 'y';

					} else if ( animationCurveRelationship.match( /Z/ ) ) {

						axis = 'z';

					} else {

						continue;

					}

					curveNodesMap.get( animationCurveID ).curves[ axis ] = animationCurve;

				}

			}

		}

		// parse nodes in FBXTree.Objects.AnimationLayer. Each layers holds references
		// to various AnimationCurveNodes and is referenced by an AnimationStack node
		// note: theoretically a stack can multiple layers, however in practice there always seems to be one per stack
		function parseAnimationLayers( FBXTree, connections, curveNodesMap ) {

			var rawLayers = FBXTree.Objects.AnimationLayer;

			var layersMap = new Map();

			for ( var nodeID in rawLayers ) {

				var layerCurveNodes = [];

				var connection = connections.get( parseInt( nodeID ) );

				if ( connection !== undefined ) {

					// all the animationCurveNodes used in the layer
					var children = connection.children;

					children.forEach( function ( child, i ) {

						if ( curveNodesMap.has( child.ID ) ) {

							var curveNode = curveNodesMap.get( child.ID );

							// check that the curves are defined for at least one axis, otherwise ignore the curveNode
							if ( curveNode.curves.x !== undefined || curveNode.curves.y !== undefined || curveNode.curves.z !== undefined ) {

								if ( layerCurveNodes[ i ] === undefined ) {

									var modelID;

									connections.get( child.ID ).parents.forEach( function ( parent ) {

										if ( parent.relationship !== undefined ) modelID = parent.ID;

									} );

									var rawModel = FBXTree.Objects.Model[ modelID.toString() ];

									var node = {

										modelName: THREE.PropertyBinding.sanitizeNodeName( rawModel.attrName ),
										initialPosition: [ 0, 0, 0 ],
										initialRotation: [ 0, 0, 0 ],
										initialScale: [ 1, 1, 1 ],

									};

									if ( 'Lcl_Translation' in rawModel ) node.initialPosition = rawModel.Lcl_Translation.value;

									if ( 'Lcl_Rotation' in rawModel ) node.initialRotation = rawModel.Lcl_Rotation.value;

									if ( 'Lcl_Scaling' in rawModel ) node.initialScale = rawModel.Lcl_Scaling.value;

									// if the animated model is pre rotated, we'll have to apply the pre rotations to every
									// animation value as well
									if ( 'PreRotation' in rawModel ) node.preRotations = rawModel.PreRotation.value;

									layerCurveNodes[ i ] = node;

								}

								layerCurveNodes[ i ][ curveNode.attr ] = curveNode;

							}



						}

					} );

					layersMap.set( parseInt( nodeID ), layerCurveNodes );

				}

			}

			return layersMap;

		}

		// parse nodes in FBXTree.Objects.AnimationStack. These are the top level node in the animation
		// hierarchy. Each Stack node will be used to create a THREE.AnimationClip
		function parseAnimStacks( FBXTree, connections, layersMap ) {

			var rawStacks = FBXTree.Objects.AnimationStack;

			// connect the stacks (clips) up to the layers
			var rawClips = {};

			for ( var nodeID in rawStacks ) {

				var children = connections.get( parseInt( nodeID ) ).children;

				if ( children.length > 1 ) {

					// it seems like stacks will always be associated with a single layer. But just in case there are files
					// where there are multiple layers per stack, we'll display a warning
					console.warn( 'THREE.FBXLoader: Encountered an animation stack with multiple layers, this is currently not supported. Ignoring subsequent layers.' );

				}

				var layer = layersMap.get( children[ 0 ].ID );

				rawClips[ nodeID ] = {

					name: rawStacks[ nodeID ].attrName,
					layer: layer,

				};

			}

			return rawClips;

		}

		// take raw animation data from parseAnimations and connect it up to the loaded models
		function addAnimations( FBXTree, connections, sceneGraph ) {

			sceneGraph.animations = [];

			var rawClips = parseAnimations( FBXTree, connections );

			if ( rawClips === undefined ) return;


			for ( var key in rawClips ) {

				var rawClip = rawClips[ key ];

				var clip = addClip( rawClip );

				sceneGraph.animations.push( clip );

			}

		}

		function addClip( rawClip ) {

			var tracks = [];

			rawClip.layer.forEach( function ( rawTracks ) {

				tracks = tracks.concat( generateTracks( rawTracks ) );

			} );

			return new THREE.AnimationClip( rawClip.name, - 1, tracks );

		}

		function generateTracks( rawTracks ) {

			var tracks = [];

			if ( rawTracks.T !== undefined && Object.keys( rawTracks.T.curves ).length > 0 ) {

				var positionTrack = generateVectorTrack( rawTracks.modelName, rawTracks.T.curves, rawTracks.initialPosition, 'position' );
				if ( positionTrack !== undefined ) tracks.push( positionTrack );

			}

			if ( rawTracks.R !== undefined && Object.keys( rawTracks.R.curves ).length > 0 ) {

				var rotationTrack = generateRotationTrack( rawTracks.modelName, rawTracks.R.curves, rawTracks.initialRotation, rawTracks.preRotations );
				if ( rotationTrack !== undefined ) tracks.push( rotationTrack );

			}

			if ( rawTracks.S !== undefined && Object.keys( rawTracks.S.curves ).length > 0 ) {

				var scaleTrack = generateVectorTrack( rawTracks.modelName, rawTracks.S.curves, rawTracks.initialScale, 'scale' );
				if ( scaleTrack !== undefined ) tracks.push( scaleTrack );

			}

			return tracks;

		}

		function generateVectorTrack( modelName, curves, initialValue, type ) {

			var times = getTimesForAllAxes( curves );
			var values = getKeyframeTrackValues( times, curves, initialValue );

			return new THREE.VectorKeyframeTrack( modelName + '.' + type, times, values );

		}

		function generateRotationTrack( modelName, curves, initialValue, preRotations ) {

			if ( curves.x !== undefined ) curves.x.values = curves.x.values.map( THREE.Math.degToRad );
			if ( curves.y !== undefined ) curves.y.values = curves.y.values.map( THREE.Math.degToRad );
			if ( curves.z !== undefined ) curves.z.values = curves.z.values.map( THREE.Math.degToRad );

			var times = getTimesForAllAxes( curves );
			var values = getKeyframeTrackValues( times, curves, initialValue );

			if ( preRotations !== undefined ) {

				preRotations = preRotations.map( THREE.Math.degToRad );
				preRotations.push( 'ZYX' );

				preRotations = new THREE.Euler().fromArray( preRotations );
				preRotations = new THREE.Quaternion().setFromEuler( preRotations );

			}

			var quaternion = new THREE.Quaternion();
			var euler = new THREE.Euler();

			var quaternionValues = [];

			for ( var i = 0; i < values.length; i += 3 ) {

				euler.set( values[ i ], values[ i + 1 ], values[ i + 2 ], 'ZYX' );

				quaternion.setFromEuler( euler );

				if ( preRotations !== undefined )quaternion.premultiply( preRotations );

				quaternion.toArray( quaternionValues, ( i / 3 ) * 4 );

			}

			return new THREE.QuaternionKeyframeTrack( modelName + '.quaternion', times, quaternionValues );

		}

		function getKeyframeTrackValues( times, curves, initialValue ) {

			var prevValue = initialValue;

			var values = [];

			var xIndex = - 1;
			var yIndex = - 1;
			var zIndex = - 1;

			times.forEach( function ( time ) {

				if ( curves.x ) xIndex = curves.x.times.indexOf( time );
				if ( curves.y ) yIndex = curves.y.times.indexOf( time );
				if ( curves.z ) zIndex = curves.z.times.indexOf( time );

				// if there is an x value defined for this frame, use that
				if ( xIndex !== - 1 ) {

					var xValue = curves.x.values[ xIndex ];
					values.push( xValue );
					prevValue[ 0 ] = xValue;

				} else {

					// otherwise use the x value from the previous frame
					values.push( prevValue[ 0 ] );

				}

				if ( yIndex !== - 1 ) {

					var yValue = curves.y.values[ yIndex ];
					values.push( yValue );
					prevValue[ 1 ] = yValue;

				} else {

					values.push( prevValue[ 1 ] );

				}

				if ( zIndex !== - 1 ) {

					var zValue = curves.z.values[ zIndex ];
					values.push( zValue );
					prevValue[ 2 ] = zValue;

				} else {

					values.push( prevValue[ 2 ] );

				}

			} );

			return values;

		}

		// For all animated objects, times are defined separately for each axis
		// Here we'll combine the times into one sorted array without duplicates
		function getTimesForAllAxes( curves ) {

			var times = [];

			// first join together the times for each axis, if defined
			if ( curves.x !== undefined ) times = times.concat( curves.x.times );
			if ( curves.y !== undefined ) times = times.concat( curves.y.times );
			if ( curves.z !== undefined ) times = times.concat( curves.z.times );

			// then sort them and remove duplicates
			times = times.sort( function ( a, b ) {

				return a - b;

			} ).filter( function ( elem, index, array ) {

				return array.indexOf( elem ) == index;

			} );

			return times;

		}

		// parse an FBX file in ASCII format
		function TextParser() {}

		Object.assign( TextParser.prototype, {

			getPrevNode: function () {

				return this.nodeStack[ this.currentIndent - 2 ];

			},

			getCurrentNode: function () {

				return this.nodeStack[ this.currentIndent - 1 ];

			},

			getCurrentProp: function () {

				return this.currentProp;

			},

			pushStack: function ( node ) {

				this.nodeStack.push( node );
				this.currentIndent += 1;

			},

			popStack: function () {

				this.nodeStack.pop();
				this.currentIndent -= 1;

			},

			setCurrentProp: function ( val, name ) {

				this.currentProp = val;
				this.currentPropName = name;

			},

			parse: function ( text ) {

				this.currentIndent = 0;
				this.allNodes = new FBXTree();
				this.nodeStack = [];
				this.currentProp = [];
				this.currentPropName = '';

				var self = this;

				var split = text.split( '\n' );

				split.forEach( function ( line, i ) {

					var matchComment = line.match( /^[\s\t]*;/ );
					var matchEmpty = line.match( /^[\s\t]*$/ );

					if ( matchComment || matchEmpty ) return;

					var matchBeginning = line.match( '^\\t{' + self.currentIndent + '}(\\w+):(.*){', '' );
					var matchProperty = line.match( '^\\t{' + ( self.currentIndent ) + '}(\\w+):[\\s\\t\\r\\n](.*)' );
					var matchEnd = line.match( '^\\t{' + ( self.currentIndent - 1 ) + '}}' );

					if ( matchBeginning ) {

						self.parseNodeBegin( line, matchBeginning );

					} else if ( matchProperty ) {

						self.parseNodeProperty( line, matchProperty, split[ ++ i ] );

					} else if ( matchEnd ) {

						self.popStack();

					} else if ( line.match( /^[^\s\t}]/ ) ) {

						// large arrays are split over multiple lines terminated with a ',' character
						// if this is encountered the line needs to be joined to the previous line
						self.parseNodePropertyContinued( line );

					}

				} );

				return this.allNodes;

			},

			parseNodeBegin: function ( line, property ) {

				var nodeName = property[ 1 ].trim().replace( /^"/, '' ).replace( /"$/, '' );

				var nodeAttrs = property[ 2 ].split( ',' ).map( function ( attr ) {

					return attr.trim().replace( /^"/, '' ).replace( /"$/, '' );

				} );

				var node = { name: nodeName };
				var attrs = this.parseNodeAttr( nodeAttrs );

				var currentNode = this.getCurrentNode();

				// a top node
				if ( this.currentIndent === 0 ) {

					this.allNodes.add( nodeName, node );

				} else { // a subnode

					// if the subnode already exists, append it
					if ( nodeName in currentNode ) {

					// special case Pose needs PoseNodes as an array
						if ( nodeName === 'PoseNode' ) {

							currentNode.PoseNode.push( node );

						} else if ( currentNode[ nodeName ].id !== undefined ) {

							currentNode[ nodeName ] = {};
							currentNode[ nodeName ][ currentNode[ nodeName ].id ] = currentNode[ nodeName ];

						}

						if ( attrs.id !== '' ) currentNode[ nodeName ][ attrs.id ] = node;

					} else if ( typeof attrs.id === 'number' ) {

						currentNode[ nodeName ] = {};
						currentNode[ nodeName ][ attrs.id ] = node;

					} else if ( nodeName !== 'Properties70' ) {

						if ( nodeName === 'PoseNode' )	currentNode[ nodeName ] = [ node ];
						else currentNode[ nodeName ] = node;

					}

				}

				if ( typeof attrs.id === 'number' ) node.id = attrs.id;
				if ( attrs.name !== '' ) node.attrName = attrs.name;
				if ( attrs.type !== '' ) node.attrType = attrs.type;

				this.pushStack( node );

			},

			parseNodeAttr: function ( attrs ) {

				var id = attrs[ 0 ];

				if ( attrs[ 0 ] !== '' ) {

					id = parseInt( attrs[ 0 ] );

					if ( isNaN( id ) ) {

						id = attrs[ 0 ];

					}

				}

				var name = '', type = '';

				if ( attrs.length > 1 ) {

					name = attrs[ 1 ].replace( /^(\w+)::/, '' );
					type = attrs[ 2 ];

				}

				return { id: id, name: name, type: type };

			},

			parseNodeProperty: function ( line, property, contentLine ) {

				var propName = property[ 1 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();
				var propValue = property[ 2 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();

				// for special case: base64 image data follows "Content: ," line
				//	Content: ,
				//	 "/9j/4RDaRXhpZgAATU0A..."
				if ( propName === 'Content' && propValue === ',' ) {

					propValue = contentLine.replace( /"/g, '' ).replace( /,$/, '' ).trim();

				}

				var currentNode = this.getCurrentNode();
				var parentName = currentNode.name;

				if ( parentName === 'Properties70' ) {

					this.parseNodeSpecialProperty( line, propName, propValue );
					return;

				}

				// Connections
				if ( propName === 'C' ) {

					var connProps = propValue.split( ',' ).slice( 1 );
					var from = parseInt( connProps[ 0 ] );
					var to = parseInt( connProps[ 1 ] );

					var rest = propValue.split( ',' ).slice( 3 );

					rest = rest.map( function ( elem ) {

						return elem.trim().replace( /^"/, '' );

					} );

					propName = 'connections';
					propValue = [ from, to ];
					append( propValue, rest );

					if ( currentNode[ propName ] === undefined ) {

						currentNode[ propName ] = [];

					}

				}

				// Node
				if ( propName === 'Node' ) currentNode.id = propValue;

				// connections
				if ( propName in currentNode && Array.isArray( currentNode[ propName ] ) ) {

					currentNode[ propName ].push( propValue );

				} else {

					if ( propName !== 'a' ) currentNode[ propName ] = propValue;
					else currentNode.a = propValue;

				}

				this.setCurrentProp( currentNode, propName );

				// convert string to array, unless it ends in ',' in which case more will be added to it
				if ( propName === 'a' && propValue.slice( - 1 ) !== ',' ) {

					currentNode.a = parseNumberArray( propValue );

				}

			},

			parseNodePropertyContinued: function ( line ) {

				var currentNode = this.getCurrentNode();

				currentNode.a += line;

				// if the line doesn't end in ',' we have reached the end of the property value
				// so convert the string to an array
				if ( line.slice( - 1 ) !== ',' ) {

					currentNode.a = parseNumberArray( currentNode.a );

				}

			},

			// parse "Property70"
			parseNodeSpecialProperty: function ( line, propName, propValue ) {

				// split this
				// P: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
				// into array like below
				// ["Lcl Scaling", "Lcl Scaling", "", "A", "1,1,1" ]
				var props = propValue.split( '",' ).map( function ( prop ) {

					return prop.trim().replace( /^\"/, '' ).replace( /\s/, '_' );

				} );

				var innerPropName = props[ 0 ];
				var innerPropType1 = props[ 1 ];
				var innerPropType2 = props[ 2 ];
				var innerPropFlag = props[ 3 ];
				var innerPropValue = props[ 4 ];

				// cast values where needed, otherwise leave as strings
				switch ( innerPropType1 ) {

					case 'int':
					case 'enum':
					case 'bool':
					case 'ULongLong':
					case 'double':
					case 'Number':
					case 'FieldOfView':
						innerPropValue = parseFloat( innerPropValue );
						break;

					case 'Color':
					case 'ColorRGB':
					case 'Vector3D':
					case 'Lcl_Translation':
					case 'Lcl_Rotation':
					case 'Lcl_Scaling':
						innerPropValue = parseNumberArray( innerPropValue );
						break;

				}

				// CAUTION: these props must append to parent's parent
				this.getPrevNode()[ innerPropName ] = {

					'type': innerPropType1,
					'type2': innerPropType2,
					'flag': innerPropFlag,
					'value': innerPropValue

				};

				this.setCurrentProp( this.getPrevNode(), innerPropName );

			},

		} );

		// Parse an FBX file in Binary format
		function BinaryParser() {}

		Object.assign( BinaryParser.prototype, {

			parse: function ( buffer ) {

				var reader = new BinaryReader( buffer );
				reader.skip( 23 ); // skip magic 23 bytes

				var version = reader.getUint32();

				console.log( 'THREE.FBXLoader: FBX binary version: ' + version );

				var allNodes = new FBXTree();

				while ( ! this.endOfContent( reader ) ) {

					var node = this.parseNode( reader, version );
					if ( node !== null ) allNodes.add( node.name, node );

				}

				return allNodes;

			},

			// Check if reader has reached the end of content.
			endOfContent: function ( reader ) {

				// footer size: 160bytes + 16-byte alignment padding
				// - 16bytes: magic
				// - padding til 16-byte alignment (at least 1byte?)
				//	(seems like some exporters embed fixed 15 or 16bytes?)
				// - 4bytes: magic
				// - 4bytes: version
				// - 120bytes: zero
				// - 16bytes: magic
				if ( reader.size() % 16 === 0 ) {

					return ( ( reader.getOffset() + 160 + 16 ) & ~ 0xf ) >= reader.size();

				} else {

					return reader.getOffset() + 160 + 16 >= reader.size();

				}

			},

			// recursively parse nodes until the end of the file is reached
			parseNode: function ( reader, version ) {

				var node = {};

				// The first three data sizes depends on version.
				var endOffset = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();
				var numProperties = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();

				// note: do not remove this even if you get a linter warning as it moves the buffer forward
				var propertyListLen = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();

				var nameLen = reader.getUint8();
				var name = reader.getString( nameLen );

				// Regards this node as NULL-record if endOffset is zero
				if ( endOffset === 0 ) return null;

				var propertyList = [];

				for ( var i = 0; i < numProperties; i ++ ) {

					propertyList.push( this.parseProperty( reader ) );

				}

				// Regards the first three elements in propertyList as id, attrName, and attrType
				var id = propertyList.length > 0 ? propertyList[ 0 ] : '';
				var attrName = propertyList.length > 1 ? propertyList[ 1 ] : '';
				var attrType = propertyList.length > 2 ? propertyList[ 2 ] : '';

				// check if this node represents just a single property
				// like (name, 0) set or (name2, [0, 1, 2]) set of {name: 0, name2: [0, 1, 2]}
				node.singleProperty = ( numProperties === 1 && reader.getOffset() === endOffset ) ? true : false;

				while ( endOffset > reader.getOffset() ) {

					var subNode = this.parseNode( reader, version );

					if ( subNode !== null ) this.parseSubNode( name, node, subNode );

				}

				node.propertyList = propertyList; // raw property list used by parent

				if ( typeof id === 'number' ) node.id = id;
				if ( attrName !== '' ) node.attrName = attrName;
				if ( attrType !== '' ) node.attrType = attrType;
				if ( name !== '' ) node.name = name;

				return node;

			},

			parseSubNode: function ( name, node, subNode ) {

				// special case: child node is single property
				if ( subNode.singleProperty === true ) {

					var value = subNode.propertyList[ 0 ];

					if ( Array.isArray( value ) ) {

						node[ subNode.name ] = subNode;

						subNode.a = value;

					} else {

						node[ subNode.name ] = value;

					}

				} else if ( name === 'Connections' && subNode.name === 'C' ) {

					var array = [];

					subNode.propertyList.forEach( function ( property, i ) {

						// first Connection is FBX type (OO, OP, etc.). We'll discard these
						if ( i !== 0 ) array.push( property );

					} );

					if ( node.connections === undefined ) {

						node.connections = [];

					}

					node.connections.push( array );

				} else if ( subNode.name === 'Properties70' ) {

					var keys = Object.keys( subNode );

					keys.forEach( function ( key ) {

						node[ key ] = subNode[ key ];

					} );

				} else if ( name === 'Properties70' && subNode.name === 'P' ) {

					var innerPropName = subNode.propertyList[ 0 ];
					var innerPropType1 = subNode.propertyList[ 1 ];
					var innerPropType2 = subNode.propertyList[ 2 ];
					var innerPropFlag = subNode.propertyList[ 3 ];
					var innerPropValue;

					if ( innerPropName.indexOf( 'Lcl ' ) === 0 ) innerPropName = innerPropName.replace( 'Lcl ', 'Lcl_' );
					if ( innerPropType1.indexOf( 'Lcl ' ) === 0 ) innerPropType1 = innerPropType1.replace( 'Lcl ', 'Lcl_' );

					if ( innerPropType1 === 'Color' || innerPropType1 === 'ColorRGB' || innerPropType1 === 'Vector' || innerPropType1 === 'Vector3D' || innerPropType1.indexOf( 'Lcl_' ) === 0 ) {

						innerPropValue = [
							subNode.propertyList[ 4 ],
							subNode.propertyList[ 5 ],
							subNode.propertyList[ 6 ]
						];

					} else {

						innerPropValue = subNode.propertyList[ 4 ];

					}

					// this will be copied to parent, see above
					node[ innerPropName ] = {

						'type': innerPropType1,
						'type2': innerPropType2,
						'flag': innerPropFlag,
						'value': innerPropValue

					};

				} else if ( node[ subNode.name ] === undefined ) {

					if ( typeof subNode.id === 'number' ) {

						node[ subNode.name ] = {};
						node[ subNode.name ][ subNode.id ] = subNode;

					} else {

						node[ subNode.name ] = subNode;

					}

				} else {

					if ( subNode.name === 'PoseNode' ) {

						if ( ! Array.isArray( node[ subNode.name ] ) ) {

							node[ subNode.name ] = [ node[ subNode.name ] ];

						}

						node[ subNode.name ].push( subNode );

					} else if ( node[ subNode.name ][ subNode.id ] === undefined ) {

						node[ subNode.name ][ subNode.id ] = subNode;

					}

				}

			},

			parseProperty: function ( reader ) {

				var type = reader.getString( 1 );

				switch ( type ) {

					case 'C':
						return reader.getBoolean();

					case 'D':
						return reader.getFloat64();

					case 'F':
						return reader.getFloat32();

					case 'I':
						return reader.getInt32();

					case 'L':
						return reader.getInt64();

					case 'R':
						var length = reader.getUint32();
						return reader.getArrayBuffer( length );

					case 'S':
						var length = reader.getUint32();
						return reader.getString( length );

					case 'Y':
						return reader.getInt16();

					case 'b':
					case 'c':
					case 'd':
					case 'f':
					case 'i':
					case 'l':

						var arrayLength = reader.getUint32();
						var encoding = reader.getUint32(); // 0: non-compressed, 1: compressed
						var compressedLength = reader.getUint32();

						if ( encoding === 0 ) {

							switch ( type ) {

								case 'b':
								case 'c':
									return reader.getBooleanArray( arrayLength );

								case 'd':
									return reader.getFloat64Array( arrayLength );

								case 'f':
									return reader.getFloat32Array( arrayLength );

								case 'i':
									return reader.getInt32Array( arrayLength );

								case 'l':
									return reader.getInt64Array( arrayLength );

							}

						}

						if ( window.Zlib === undefined ) {

							console.error( 'THREE.FBXLoader: External library Inflate.min.js required, obtain or import from https://github.com/imaya/zlib.js' );

						}

						var inflate = new Zlib.Inflate( new Uint8Array( reader.getArrayBuffer( compressedLength ) ) ); // eslint-disable-line no-undef
						var reader2 = new BinaryReader( inflate.decompress().buffer );

						switch ( type ) {

							case 'b':
							case 'c':
								return reader2.getBooleanArray( arrayLength );

							case 'd':
								return reader2.getFloat64Array( arrayLength );

							case 'f':
								return reader2.getFloat32Array( arrayLength );

							case 'i':
								return reader2.getInt32Array( arrayLength );

							case 'l':
								return reader2.getInt64Array( arrayLength );

						}

					default:
						throw new Error( 'THREE.FBXLoader: Unknown property type ' + type );

				}

			}

		} );


		function BinaryReader( buffer, littleEndian ) {

			this.dv = new DataView( buffer );
			this.offset = 0;
			this.littleEndian = ( littleEndian !== undefined ) ? littleEndian : true;

		}

		Object.assign( BinaryReader.prototype, {

			getOffset: function () {

				return this.offset;

			},

			size: function () {

				return this.dv.buffer.byteLength;

			},

			skip: function ( length ) {

				this.offset += length;

			},

			// seems like true/false representation depends on exporter.
			// true: 1 or 'Y'(=0x59), false: 0 or 'T'(=0x54)
			// then sees LSB.
			getBoolean: function () {

				return ( this.getUint8() & 1 ) === 1;

			},

			getBooleanArray: function ( size ) {

				var a = [];

				for ( var i = 0; i < size; i ++ ) {

					a.push( this.getBoolean() );

				}

				return a;

			},

			getUint8: function () {

				var value = this.dv.getUint8( this.offset );
				this.offset += 1;
				return value;

			},

			getInt16: function () {

				var value = this.dv.getInt16( this.offset, this.littleEndian );
				this.offset += 2;
				return value;

			},

			getInt32: function () {

				var value = this.dv.getInt32( this.offset, this.littleEndian );
				this.offset += 4;
				return value;

			},

			getInt32Array: function ( size ) {

				var a = [];

				for ( var i = 0; i < size; i ++ ) {

					a.push( this.getInt32() );

				}

				return a;

			},

			getUint32: function () {

				var value = this.dv.getUint32( this.offset, this.littleEndian );
				this.offset += 4;
				return value;

			},

			// JavaScript doesn't support 64-bit integer so calculate this here
			// 1 << 32 will return 1 so using multiply operation instead here.
			// There's a possibility that this method returns wrong value if the value
			// is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
			// TODO: safely handle 64-bit integer
			getInt64: function () {

				var low, high;

				if ( this.littleEndian ) {

					low = this.getUint32();
					high = this.getUint32();

				} else {

					high = this.getUint32();
					low = this.getUint32();

				}

				// calculate negative value
				if ( high & 0x80000000 ) {

					high = ~ high & 0xFFFFFFFF;
					low = ~ low & 0xFFFFFFFF;

					if ( low === 0xFFFFFFFF ) high = ( high + 1 ) & 0xFFFFFFFF;

					low = ( low + 1 ) & 0xFFFFFFFF;

					return - ( high * 0x100000000 + low );

				}

				return high * 0x100000000 + low;

			},

			getInt64Array: function ( size ) {

				var a = [];

				for ( var i = 0; i < size; i ++ ) {

					a.push( this.getInt64() );

				}

				return a;

			},

			// Note: see getInt64() comment
			getUint64: function () {

				var low, high;

				if ( this.littleEndian ) {

					low = this.getUint32();
					high = this.getUint32();

				} else {

					high = this.getUint32();
					low = this.getUint32();

				}

				return high * 0x100000000 + low;

			},

			getFloat32: function () {

				var value = this.dv.getFloat32( this.offset, this.littleEndian );
				this.offset += 4;
				return value;

			},

			getFloat32Array: function ( size ) {

				var a = [];

				for ( var i = 0; i < size; i ++ ) {

					a.push( this.getFloat32() );

				}

				return a;

			},

			getFloat64: function () {

				var value = this.dv.getFloat64( this.offset, this.littleEndian );
				this.offset += 8;
				return value;

			},

			getFloat64Array: function ( size ) {

				var a = [];

				for ( var i = 0; i < size; i ++ ) {

					a.push( this.getFloat64() );

				}

				return a;

			},

			getArrayBuffer: function ( size ) {

				var value = this.dv.buffer.slice( this.offset, this.offset + size );
				this.offset += size;
				return value;

			},

			getString: function ( size ) {

				var a = new Uint8Array( size );

				for ( var i = 0; i < size; i ++ ) {

					a[ i ] = this.getUint8();

				}

				var nullByte = a.indexOf( 0 );
				if ( nullByte >= 0 ) a = a.slice( 0, nullByte );

				return THREE.LoaderUtils.decodeText( a );

			}

		} );

		// FBXTree holds a representation of the FBX data, returned by the TextParser ( FBX ASCII format)
		// and BinaryParser( FBX Binary format)
		function FBXTree() {}

		Object.assign( FBXTree.prototype, {

			add: function ( key, val ) {

				this[ key ] = val;

			},

		} );

		function isFbxFormatBinary( buffer ) {

			var CORRECT = 'Kaydara FBX Binary  \0';

			return buffer.byteLength >= CORRECT.length && CORRECT === convertArrayBufferToString( buffer, 0, CORRECT.length );

		}

		function isFbxFormatASCII( text ) {

			var CORRECT = [ 'K', 'a', 'y', 'd', 'a', 'r', 'a', '\\', 'F', 'B', 'X', '\\', 'B', 'i', 'n', 'a', 'r', 'y', '\\', '\\' ];

			var cursor = 0;

			function read( offset ) {

				var result = text[ offset - 1 ];
				text = text.slice( cursor + offset );
				cursor ++;
				return result;

			}

			for ( var i = 0; i < CORRECT.length; ++ i ) {

				var num = read( 1 );
				if ( num === CORRECT[ i ] ) {

					return false;

				}

			}

			return true;

		}

		function getFbxVersion( text ) {

			var versionRegExp = /FBXVersion: (\d+)/;
			var match = text.match( versionRegExp );
			if ( match ) {

				var version = parseInt( match[ 1 ] );
				return version;

			}
			throw new Error( 'THREE.FBXLoader: Cannot find the version number for the file given.' );

		}

		// Converts FBX ticks into real time seconds.
		function convertFBXTimeToSeconds( time ) {

			return time / 46186158000;

		}


		// Parses comma separated list of numbers and returns them an array.
		// Used internally by the TextParser
		function parseNumberArray( value ) {

			var array = value.split( ',' ).map( function ( val ) {

				return parseFloat( val );

			} );

			return array;

		}

		function convertArrayBufferToString( buffer, from, to ) {

			if ( from === undefined ) from = 0;
			if ( to === undefined ) to = buffer.byteLength;

			return THREE.LoaderUtils.decodeText( new Uint8Array( buffer, from, to ) );

		}

		function append( a, b ) {

			for ( var i = 0, j = a.length, l = b.length; i < l; i ++, j ++ ) {

				a[ j ] = b[ i ];

			}

		}

		function slice( a, b, from, to ) {

			for ( var i = from, j = 0; i < to; i ++, j ++ ) {

				a[ j ] = b[ i ];

			}

			return a;

		}

	} )();

	/**
	 * @author Virtulous / https://virtulo.us/
	 */

	THREE.AssimpLoader = function ( manager ) {

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	};

	THREE.AssimpLoader.prototype = {

		constructor: THREE.AssimpLoader,

		crossOrigin: 'Anonymous',

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var path = THREE.LoaderUtils.extractUrlBase( url );

			var loader = new THREE.FileLoader( this.manager );
			loader.setResponseType( 'arraybuffer' );

			loader.load( url, function ( buffer ) {

				onLoad( scope.parse( buffer, path ) );

			}, onProgress, onError );

		},

		setCrossOrigin: function ( value ) {

			this.crossOrigin = value;

		},

		parse: function ( buffer, path ) {

			var textureLoader = new THREE.TextureLoader( this.manager );
			textureLoader.setPath( path ).setCrossOrigin( this.crossOrigin );

			var Virtulous = {};

			Virtulous.KeyFrame = function ( time, matrix ) {

				this.time = time;
				this.matrix = matrix.clone();
				this.position = new THREE.Vector3();
				this.quaternion = new THREE.Quaternion();
				this.scale = new THREE.Vector3( 1, 1, 1 );
				this.matrix.decompose( this.position, this.quaternion, this.scale );
				this.clone = function () {

					var n = new Virtulous.KeyFrame( this.time, this.matrix );
					return n;

				};
				this.lerp = function ( nextKey, time ) {

					time -= this.time;
					var dist = ( nextKey.time - this.time );
					var l = time / dist;
					var l2 = 1 - l;
					var keypos = this.position;
					var keyrot = this.quaternion;
					//      var keyscl =  key.parentspaceScl || key.scl;
					var key2pos = nextKey.position;
					var key2rot = nextKey.quaternion;
					//  var key2scl =  key2.parentspaceScl || key2.scl;
					Virtulous.KeyFrame.tempAniPos.x = keypos.x * l2 + key2pos.x * l;
					Virtulous.KeyFrame.tempAniPos.y = keypos.y * l2 + key2pos.y * l;
					Virtulous.KeyFrame.tempAniPos.z = keypos.z * l2 + key2pos.z * l;
					//     tempAniScale.x = keyscl[0] * l2 + key2scl[0] * l;
					//     tempAniScale.y = keyscl[1] * l2 + key2scl[1] * l;
					//     tempAniScale.z = keyscl[2] * l2 + key2scl[2] * l;
					Virtulous.KeyFrame.tempAniQuat.set( keyrot.x, keyrot.y, keyrot.z, keyrot.w );
					Virtulous.KeyFrame.tempAniQuat.slerp( key2rot, l );
					return Virtulous.KeyFrame.tempAniMatrix.compose( Virtulous.KeyFrame.tempAniPos, Virtulous.KeyFrame.tempAniQuat, Virtulous.KeyFrame.tempAniScale );

				};

			};

			Virtulous.KeyFrame.tempAniPos = new THREE.Vector3();
			Virtulous.KeyFrame.tempAniQuat = new THREE.Quaternion();
			Virtulous.KeyFrame.tempAniScale = new THREE.Vector3( 1, 1, 1 );
			Virtulous.KeyFrame.tempAniMatrix = new THREE.Matrix4();
			Virtulous.KeyFrameTrack = function () {

				this.keys = [];
				this.target = null;
				this.time = 0;
				this.length = 0;
				this._accelTable = {};
				this.fps = 20;
				this.addKey = function ( key ) {

					this.keys.push( key );

				};
				this.init = function () {

					this.sortKeys();

					if ( this.keys.length > 0 )
						this.length = this.keys[ this.keys.length - 1 ].time;
					else
						this.length = 0;

					if ( ! this.fps ) return;

					for ( var j = 0; j < this.length * this.fps; j ++ ) {

						for ( var i = 0; i < this.keys.length; i ++ ) {

							if ( this.keys[ i ].time == j ) {

								this._accelTable[ j ] = i;
								break;

							} else if ( this.keys[ i ].time < j / this.fps && this.keys[ i + 1 ] && this.keys[ i + 1 ].time >= j / this.fps ) {

								this._accelTable[ j ] = i;
								break;

							}

						}

					}

				};

				this.parseFromThree = function ( data ) {

					var fps = data.fps;
					this.target = data.node;
					var track = data.hierarchy[ 0 ].keys;
					for ( var i = 0; i < track.length; i ++ ) {

						this.addKey( new Virtulous.KeyFrame( i / fps || track[ i ].time, track[ i ].targets[ 0 ].data ) );

					}
					this.init();

				};

				this.parseFromCollada = function ( data ) {

					var track = data.keys;
					var fps = this.fps;

					for ( var i = 0; i < track.length; i ++ ) {

						this.addKey( new Virtulous.KeyFrame( i / fps || track[ i ].time, track[ i ].matrix ) );

					}

					this.init();

				};

				this.sortKeys = function () {

					this.keys.sort( this.keySortFunc );

				};

				this.keySortFunc = function ( a, b ) {

					return a.time - b.time;

				};

				this.clone = function () {

					var t = new Virtulous.KeyFrameTrack();
					t.target = this.target;
					t.time = this.time;
					t.length = this.length;

					for ( var i = 0; i < this.keys.length; i ++ ) {

						t.addKey( this.keys[ i ].clone() );

					}

					t.init();
					return t;

				};

				this.reTarget = function ( root, compareitor ) {

					if ( ! compareitor ) compareitor = Virtulous.TrackTargetNodeNameCompare;
					this.target = compareitor( root, this.target );

				};

				this.keySearchAccel = function ( time ) {

					time *= this.fps;
					time = Math.floor( time );
					return this._accelTable[ time ] || 0;

				};

				this.setTime = function ( time ) {

					time = Math.abs( time );
					if ( this.length )
						time = time % this.length + .05;
					var key0 = null;
					var key1 = null;

					for ( var i = this.keySearchAccel( time ); i < this.keys.length; i ++ ) {

						if ( this.keys[ i ].time == time ) {

							key0 = this.keys[ i ];
							key1 = this.keys[ i ];
							break;

						} else if ( this.keys[ i ].time < time && this.keys[ i + 1 ] && this.keys[ i + 1 ].time > time ) {

							key0 = this.keys[ i ];
							key1 = this.keys[ i + 1 ];
							break;

						} else if ( this.keys[ i ].time < time && i == this.keys.length - 1 ) {

							key0 = this.keys[ i ];
							key1 = this.keys[ 0 ].clone();
							key1.time += this.length + .05;
							break;

						}

					}

					if ( key0 && key1 && key0 !== key1 ) {

						this.target.matrixAutoUpdate = false;
						this.target.matrix.copy( key0.lerp( key1, time ) );
						this.target.matrixWorldNeedsUpdate = true;
						return;

					}

					if ( key0 && key1 && key0 == key1 ) {

						this.target.matrixAutoUpdate = false;
						this.target.matrix.copy( key0.matrix );
						this.target.matrixWorldNeedsUpdate = true;
						return;

					}

				};

			};

			Virtulous.TrackTargetNodeNameCompare = function ( root, target ) {

				function find( node, name ) {

					if ( node.name == name )
						return node;

					for ( var i = 0; i < node.children.length; i ++ ) {

						var r = find( node.children[ i ], name );
						if ( r ) return r;

					}

					return null;

				}

				return find( root, target.name );

			};

			Virtulous.Animation = function () {

				this.tracks = [];
				this.length = 0;

				this.addTrack = function ( track ) {

					this.tracks.push( track );
					this.length = Math.max( track.length, this.length );

				};

				this.setTime = function ( time ) {

					this.time = time;

					for ( var i = 0; i < this.tracks.length; i ++ )
						this.tracks[ i ].setTime( time );

				};

				this.clone = function ( target, compareitor ) {

					if ( ! compareitor ) compareitor = Virtulous.TrackTargetNodeNameCompare;
					var n = new Virtulous.Animation();
					n.target = target;
					for ( var i = 0; i < this.tracks.length; i ++ ) {

						var track = this.tracks[ i ].clone();
						track.reTarget( target, compareitor );
						n.addTrack( track );

					}

					return n;

				};

			};

			var ASSBIN_CHUNK_AICAMERA = 0x1234;
			var ASSBIN_CHUNK_AILIGHT = 0x1235;
			var ASSBIN_CHUNK_AITEXTURE = 0x1236;
			var ASSBIN_CHUNK_AIMESH = 0x1237;
			var ASSBIN_CHUNK_AINODEANIM = 0x1238;
			var ASSBIN_CHUNK_AISCENE = 0x1239;
			var ASSBIN_CHUNK_AIBONE = 0x123a;
			var ASSBIN_CHUNK_AIANIMATION = 0x123b;
			var ASSBIN_CHUNK_AINODE = 0x123c;
			var ASSBIN_CHUNK_AIMATERIAL = 0x123d;
			var ASSBIN_CHUNK_AIMATERIALPROPERTY = 0x123e;
			var ASSBIN_MESH_HAS_POSITIONS = 0x1;
			var ASSBIN_MESH_HAS_NORMALS = 0x2;
			var ASSBIN_MESH_HAS_TANGENTS_AND_BITANGENTS = 0x4;
			var ASSBIN_MESH_HAS_TEXCOORD_BASE = 0x100;
			var ASSBIN_MESH_HAS_COLOR_BASE = 0x10000;
			var AI_MAX_NUMBER_OF_COLOR_SETS = 1;
			var AI_MAX_NUMBER_OF_TEXTURECOORDS = 4;
			//! A directional light source has a well-defined direction
			//! but is infinitely far away. That's quite a good
			//! approximation for sun light.
			var aiLightSource_DIRECTIONAL = 0x1;
			//! A spot light source emits light in a specific
			//! angle. It has a position and a direction it is pointing to.
			//! A good example for a spot light is a light spot in
			//! sport arenas.
			var aiLightSource_SPOT = 0x3;
			/** The texture is combined with the result of the diffuse
			 *  lighting equation.
			 */
			var aiTextureType_DIFFUSE = 0x1;
			/** The texture is a (tangent space) normal-map.
			 *
			 *  Again, there are several conventions for tangent-space
			 *  normal maps. Assimp does (intentionally) not
			 *  distinguish here.
			 */
			var aiTextureType_NORMALS = 0x6;
			/** The texture defines per-pixel opacity.
			 *
			 *  Usually 'white' means opaque and 'black' means
			 *  'transparency'. Or quite the opposite. Have fun.
			 */
			var aiTextureType_OPACITY = 0x8;
			/** Lightmap texture (aka Ambient Occlusion)
			 *
			 *  Both 'Lightmaps' and dedicated 'ambient occlusion maps' are
			 *  covered by this material property. The texture contains a
			 *  scaling value for the final color value of a pixel. Its
			 *  intensity is not affected by incoming light.
			 */
			var aiTextureType_LIGHTMAP = 0xA;
			var BONESPERVERT = 4;

			function ASSBIN_MESH_HAS_TEXCOORD( n ) {

				return ASSBIN_MESH_HAS_TEXCOORD_BASE << n;

			}

			function ASSBIN_MESH_HAS_COLOR( n ) {

				return ASSBIN_MESH_HAS_COLOR_BASE << n;

			}

			function markBones( scene ) {

				for ( var i in scene.mMeshes ) {

					var mesh = scene.mMeshes[ i ];
					for ( var k in mesh.mBones ) {

						var boneNode = scene.findNode( mesh.mBones[ k ].mName );
						if ( boneNode )
							boneNode.isBone = true;

					}

				}

			}
			function cloneTreeToBones( root, scene ) {

				var rootBone = new THREE.Bone();
				rootBone.matrix.copy( root.matrix );
				rootBone.matrixWorld.copy( root.matrixWorld );
				rootBone.position.copy( root.position );
				rootBone.quaternion.copy( root.quaternion );
				rootBone.scale.copy( root.scale );
				scene.nodeCount ++;
				rootBone.name = "bone_" + root.name + scene.nodeCount.toString();

				if ( ! scene.nodeToBoneMap[ root.name ] )
					scene.nodeToBoneMap[ root.name ] = [];
				scene.nodeToBoneMap[ root.name ].push( rootBone );
				for ( var i in root.children ) {

					var child = cloneTreeToBones( root.children[ i ], scene );
					if ( child )
						rootBone.add( child );

				}

				return rootBone;

			}

			function sortWeights( indexes, weights ) {

				var pairs = [];

				for ( var i = 0; i < indexes.length; i ++ ) {

					pairs.push( {
						i: indexes[ i ],
						w: weights[ i ]
					} );

				}

				pairs.sort( function ( a, b ) {

					return b.w - a.w;

				 } );

				while ( pairs.length < 4 ) {

					pairs.push( {
						i: 0,
						w: 0
					} );

				}

				if ( pairs.length > 4 )
					pairs.length = 4;
				var sum = 0;

				for ( var i = 0; i < 4; i ++ ) {

					sum += pairs[ i ].w * pairs[ i ].w;

				}

				sum = Math.sqrt( sum );

				for ( var i = 0; i < 4; i ++ ) {

					pairs[ i ].w = pairs[ i ].w / sum;
					indexes[ i ] = pairs[ i ].i;
					weights[ i ] = pairs[ i ].w;

				}

			}

			function findMatchingBone( root, name ) {

				if ( root.name.indexOf( "bone_" + name ) == 0 )
					return root;

				for ( var i in root.children ) {

					var ret = findMatchingBone( root.children[ i ], name );

					if ( ret )
						return ret;

				}

				return undefined;

			}

			function aiMesh() {

				this.mPrimitiveTypes = 0;
				this.mNumVertices = 0;
				this.mNumFaces = 0;
				this.mNumBones = 0;
				this.mMaterialIndex = 0;
				this.mVertices = [];
				this.mNormals = [];
				this.mTangents = [];
				this.mBitangents = [];
				this.mColors = [
					[]
				];
				this.mTextureCoords = [
					[]
				];
				this.mFaces = [];
				this.mBones = [];
				this.hookupSkeletons = function ( scene, threeScene ) {

					if ( this.mBones.length == 0 ) return;

					var allBones = [];
					var offsetMatrix = [];
					var skeletonRoot = scene.findNode( this.mBones[ 0 ].mName );

					while ( skeletonRoot.mParent && skeletonRoot.mParent.isBone ) {

						skeletonRoot = skeletonRoot.mParent;

					}

					var threeSkeletonRoot = skeletonRoot.toTHREE( scene );
					var threeSkeletonRootBone = cloneTreeToBones( threeSkeletonRoot, scene );
					this.threeNode.add( threeSkeletonRootBone );

					for ( var i = 0; i < this.mBones.length; i ++ ) {

						var bone = findMatchingBone( threeSkeletonRootBone, this.mBones[ i ].mName );

						if ( bone ) {

							var tbone = bone;
							allBones.push( tbone );
							//tbone.matrixAutoUpdate = false;
							offsetMatrix.push( this.mBones[ i ].mOffsetMatrix.toTHREE() );

						} else {

							var skeletonRoot = scene.findNode( this.mBones[ i ].mName );
							if ( ! skeletonRoot ) return;
							var threeSkeletonRoot = skeletonRoot.toTHREE( scene );
							var threeSkeletonRootParent = threeSkeletonRoot.parent;
							var threeSkeletonRootBone = cloneTreeToBones( threeSkeletonRoot, scene );
							this.threeNode.add( threeSkeletonRootBone );
							var bone = findMatchingBone( threeSkeletonRootBone, this.mBones[ i ].mName );
							var tbone = bone;
							allBones.push( tbone );
							//tbone.matrixAutoUpdate = false;
							offsetMatrix.push( this.mBones[ i ].mOffsetMatrix.toTHREE() );

						}

					}
					var skeleton = new THREE.Skeleton( allBones, offsetMatrix );

					this.threeNode.bind( skeleton, new THREE.Matrix4() );
					this.threeNode.material.skinning = true;

				};

				this.toTHREE = function ( scene ) {

					if ( this.threeNode ) return this.threeNode;
					var geometry = new THREE.BufferGeometry();
					var mat;
					if ( scene.mMaterials[ this.mMaterialIndex ] )
						mat = scene.mMaterials[ this.mMaterialIndex ].toTHREE( scene );
					else
						mat = new THREE.MeshLambertMaterial();
					geometry.setIndex( new THREE.BufferAttribute( new Uint32Array( this.mIndexArray ), 1 ) );
					geometry.addAttribute( 'position', new THREE.BufferAttribute( this.mVertexBuffer, 3 ) );
					if ( this.mNormalBuffer && this.mNormalBuffer.length > 0 )
						geometry.addAttribute( 'normal', new THREE.BufferAttribute( this.mNormalBuffer, 3 ) );
					if ( this.mColorBuffer && this.mColorBuffer.length > 0 )
						geometry.addAttribute( 'color', new THREE.BufferAttribute( this.mColorBuffer, 4 ) );
					if ( this.mTexCoordsBuffers[ 0 ] && this.mTexCoordsBuffers[ 0 ].length > 0 )
						geometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( this.mTexCoordsBuffers[ 0 ] ), 2 ) );
					if ( this.mTexCoordsBuffers[ 1 ] && this.mTexCoordsBuffers[ 1 ].length > 0 )
						geometry.addAttribute( 'uv1', new THREE.BufferAttribute( new Float32Array( this.mTexCoordsBuffers[ 1 ] ), 2 ) );
					if ( this.mTangentBuffer && this.mTangentBuffer.length > 0 )
						geometry.addAttribute( 'tangents', new THREE.BufferAttribute( this.mTangentBuffer, 3 ) );
					if ( this.mBitangentBuffer && this.mBitangentBuffer.length > 0 )
						geometry.addAttribute( 'bitangents', new THREE.BufferAttribute( this.mBitangentBuffer, 3 ) );
					if ( this.mBones.length > 0 ) {

						var weights = [];
						var bones = [];

						for ( var i = 0; i < this.mBones.length; i ++ ) {

							for ( var j = 0; j < this.mBones[ i ].mWeights.length; j ++ ) {

								var weight = this.mBones[ i ].mWeights[ j ];
								if ( weight ) {

									if ( ! weights[ weight.mVertexId ] ) weights[ weight.mVertexId ] = [];
									if ( ! bones[ weight.mVertexId ] ) bones[ weight.mVertexId ] = [];
									weights[ weight.mVertexId ].push( weight.mWeight );
									bones[ weight.mVertexId ].push( parseInt( i ) );

								}

							}

						}

						for ( var i in bones ) {

							sortWeights( bones[ i ], weights[ i ] );

						}

						var _weights = [];
						var _bones = [];

						for ( var i = 0; i < weights.length; i ++ ) {

							for ( var j = 0; j < 4; j ++ ) {

								if ( weights[ i ] && bones[ i ] ) {

									_weights.push( weights[ i ][ j ] );
									_bones.push( bones[ i ][ j ] );

								} else {

									_weights.push( 0 );
									_bones.push( 0 );

								}

							}

						}

						geometry.addAttribute( 'skinWeight', new THREE.BufferAttribute( new Float32Array( _weights ), BONESPERVERT ) );
						geometry.addAttribute( 'skinIndex', new THREE.BufferAttribute( new Float32Array( _bones ), BONESPERVERT ) );

					}

					var mesh;

					if ( this.mBones.length == 0 )
						mesh = new THREE.Mesh( geometry, mat );

					if ( this.mBones.length > 0 )
						mesh = new THREE.SkinnedMesh( geometry, mat );

					this.threeNode = mesh;
					//mesh.matrixAutoUpdate = false;
					return mesh;

				};

			}

			function aiFace() {

				this.mNumIndices = 0;
				this.mIndices = [];

			}

			function aiVector3D() {

				this.x = 0;
				this.y = 0;
				this.z = 0;

				this.toTHREE = function () {

					return new THREE.Vector3( this.x, this.y, this.z );

				};

			}

			function aiColor3D() {

				this.r = 0;
				this.g = 0;
				this.b = 0;
				this.a = 0;
				this.toTHREE = function () {

					return new THREE.Color( this.r, this.g, this.b, 1 );

				};

			}

			function aiQuaternion() {

				this.x = 0;
				this.y = 0;
				this.z = 0;
				this.w = 0;
				this.toTHREE = function () {

					return new THREE.Quaternion( this.x, this.y, this.z, this.w );

				};

			}

			function aiVertexWeight() {

				this.mVertexId = 0;
				this.mWeight = 0;

			}

			function aiString() {

				this.data = [];
				this.toString = function () {

					var str = '';
					this.data.forEach( function ( i ) {

						str += ( String.fromCharCode( i ) );

					} );
					return str.replace( /[^\x20-\x7E]+/g, '' );

				};

			}

			function aiVectorKey() {

				this.mTime = 0;
				this.mValue = null;

			}

			function aiQuatKey() {

				this.mTime = 0;
				this.mValue = null;

			}

			function aiNode() {

				this.mName = '';
				this.mTransformation = [];
				this.mNumChildren = 0;
				this.mNumMeshes = 0;
				this.mMeshes = [];
				this.mChildren = [];
				this.toTHREE = function ( scene ) {

					if ( this.threeNode ) return this.threeNode;
					var o = new THREE.Object3D();
					o.name = this.mName;
					o.matrix = this.mTransformation.toTHREE();

					for ( var i = 0; i < this.mChildren.length; i ++ ) {

						o.add( this.mChildren[ i ].toTHREE( scene ) );

					}

					for ( var i = 0; i < this.mMeshes.length; i ++ ) {

						o.add( scene.mMeshes[ this.mMeshes[ i ] ].toTHREE( scene ) );

					}

					this.threeNode = o;
					//o.matrixAutoUpdate = false;
					o.matrix.decompose( o.position, o.quaternion, o.scale );
					return o;

				};

			}

			function aiBone() {

				this.mName = '';
				this.mNumWeights = 0;
				this.mOffsetMatrix = 0;

			}

			function aiMaterialProperty() {

				this.mKey = "";
				this.mSemantic = 0;
				this.mIndex = 0;
				this.mData = [];
				this.mDataLength = 0;
				this.mType = 0;
				this.dataAsColor = function () {

					var array = ( new Uint8Array( this.mData ) ).buffer;
					var reader = new DataView( array );
					var r = reader.getFloat32( 0, true );
					var g = reader.getFloat32( 4, true );
					var b = reader.getFloat32( 8, true );
					//var a = reader.getFloat32(12, true);
					return new THREE.Color( r, g, b );

				};

				this.dataAsFloat = function () {

					var array = ( new Uint8Array( this.mData ) ).buffer;
					var reader = new DataView( array );
					var r = reader.getFloat32( 0, true );
					return r;

				};

				this.dataAsBool = function () {

					var array = ( new Uint8Array( this.mData ) ).buffer;
					var reader = new DataView( array );
					var r = reader.getFloat32( 0, true );
					return !! r;

				};

				this.dataAsString = function () {

					var s = new aiString();
					s.data = this.mData;
					return s.toString();

				};

				this.dataAsMap = function () {

					var s = new aiString();
					s.data = this.mData;
					var path = s.toString();
					path = path.replace( /\\/g, '/' );

					if ( path.indexOf( '/' ) != - 1 ) {

						path = path.substr( path.lastIndexOf( '/' ) + 1 );

					}

					return textureLoader.load( path );

				};

			}
			var namePropMapping = {

				"?mat.name": "name",
				"$mat.shadingm": "shading",
				"$mat.twosided": "twoSided",
				"$mat.wireframe": "wireframe",
				"$clr.ambient": "ambient",
				"$clr.diffuse": "color",
				"$clr.specular": "specular",
				"$clr.emissive": "emissive",
				"$clr.transparent": "transparent",
				"$clr.reflective": "reflect",
				"$mat.shininess": "shininess",
				"$mat.reflectivity": "reflectivity",
				"$mat.refracti": "refraction",
				"$tex.file": "map"

			};

			var nameTypeMapping = {

				"?mat.name": "string",
				"$mat.shadingm": "bool",
				"$mat.twosided": "bool",
				"$mat.wireframe": "bool",
				"$clr.ambient": "color",
				"$clr.diffuse": "color",
				"$clr.specular": "color",
				"$clr.emissive": "color",
				"$clr.transparent": "color",
				"$clr.reflective": "color",
				"$mat.shininess": "float",
				"$mat.reflectivity": "float",
				"$mat.refracti": "float",
				"$tex.file": "map"

			};

			function aiMaterial() {

				this.mNumAllocated = 0;
				this.mNumProperties = 0;
				this.mProperties = [];
				this.toTHREE = function ( scene ) {

					var name = this.mProperties[ 0 ].dataAsString();
					var mat = new THREE.MeshPhongMaterial();

					for ( var i = 0; i < this.mProperties.length; i ++ ) {

						if ( nameTypeMapping[ this.mProperties[ i ].mKey ] == 'float' )
							mat[ namePropMapping[ this.mProperties[ i ].mKey ] ] = this.mProperties[ i ].dataAsFloat();
						if ( nameTypeMapping[ this.mProperties[ i ].mKey ] == 'color' )
							mat[ namePropMapping[ this.mProperties[ i ].mKey ] ] = this.mProperties[ i ].dataAsColor();
						if ( nameTypeMapping[ this.mProperties[ i ].mKey ] == 'bool' )
							mat[ namePropMapping[ this.mProperties[ i ].mKey ] ] = this.mProperties[ i ].dataAsBool();
						if ( nameTypeMapping[ this.mProperties[ i ].mKey ] == 'string' )
							mat[ namePropMapping[ this.mProperties[ i ].mKey ] ] = this.mProperties[ i ].dataAsString();
						if ( nameTypeMapping[ this.mProperties[ i ].mKey ] == 'map' ) {

							var prop = this.mProperties[ i ];
							if ( prop.mSemantic == aiTextureType_DIFFUSE )
								mat.map = this.mProperties[ i ].dataAsMap();
							if ( prop.mSemantic == aiTextureType_NORMALS )
								mat.normalMap = this.mProperties[ i ].dataAsMap();
							if ( prop.mSemantic == aiTextureType_LIGHTMAP )
								mat.lightMap = this.mProperties[ i ].dataAsMap();
							if ( prop.mSemantic == aiTextureType_OPACITY )
								mat.alphaMap = this.mProperties[ i ].dataAsMap();

						}

					}

					mat.ambient.r = .53;
					mat.ambient.g = .53;
					mat.ambient.b = .53;
					mat.color.r = 1;
					mat.color.g = 1;
					mat.color.b = 1;
					return mat;

				};

			}


			function veclerp( v1, v2, l ) {

				var v = new THREE.Vector3();
				var lm1 = 1 - l;
				v.x = v1.x * l + v2.x * lm1;
				v.y = v1.y * l + v2.y * lm1;
				v.z = v1.z * l + v2.z * lm1;
				return v;

			}

			function quatlerp( q1, q2, l ) {

				return q1.clone().slerp( q2, 1 - l );

			}

			function sampleTrack( keys, time, lne, lerp ) {

				if ( keys.length == 1 ) return keys[ 0 ].mValue.toTHREE();

				var dist = Infinity;
				var key = null;
				var nextKey = null;

				for ( var i = 0; i < keys.length; i ++ ) {

					var timeDist = Math.abs( keys[ i ].mTime - time );

					if ( timeDist < dist && keys[ i ].mTime <= time ) {

						dist = timeDist;
						key = keys[ i ];
						nextKey = keys[ i + 1 ];

					}

				}

				if ( ! key ) {
					
					return null;

				} else if ( nextKey ) {

					var dT = nextKey.mTime - key.mTime;
					var T = key.mTime - time;
					var l = T / dT;

					return lerp( key.mValue.toTHREE(), nextKey.mValue.toTHREE(), l );

				} else {

					nextKey = keys[ 0 ].clone();
					nextKey.mTime += lne;

					var dT = nextKey.mTime - key.mTime;
					var T = key.mTime - time;
					var l = T / dT;

					return lerp( key.mValue.toTHREE(), nextKey.mValue.toTHREE(), l );
					
				}

			}

			function aiNodeAnim() {

				this.mNodeName = "";
				this.mNumPositionKeys = 0;
				this.mNumRotationKeys = 0;
				this.mNumScalingKeys = 0;
				this.mPositionKeys = [];
				this.mRotationKeys = [];
				this.mScalingKeys = [];
				this.mPreState = "";
				this.mPostState = "";
				this.init = function ( tps ) {

					if ( ! tps ) tps = 1;

					function t( t ) {

						t.mTime /= tps;

					}

					this.mPositionKeys.forEach( t );
					this.mRotationKeys.forEach( t );
					this.mScalingKeys.forEach( t );

				};

				this.sortKeys = function () {

					function comp( a, b ) {

						return a.mTime - b.mTime;

					}

					this.mPositionKeys.sort( comp );
					this.mRotationKeys.sort( comp );
					this.mScalingKeys.sort( comp );

				};

				this.getLength = function () {

					return Math.max(
						Math.max.apply( null, this.mPositionKeys.map( function ( a ) {

							return a.mTime;

						} ) ),
						Math.max.apply( null, this.mRotationKeys.map( function ( a ) {

							return a.mTime;

						} ) ),
						Math.max.apply( null, this.mScalingKeys.map( function ( a ) {

							return a.mTime;

					 } ) )
					);

				};

				this.toTHREE = function ( o, tps ) {

					this.sortKeys();
					var length = this.getLength();
					var track = new Virtulous.KeyFrameTrack();

					for ( var i = 0; i < length; i += .05 ) {

						var matrix = new THREE.Matrix4();
						var time = i;
						var pos = sampleTrack( this.mPositionKeys, time, length, veclerp );
						var scale = sampleTrack( this.mScalingKeys, time, length, veclerp );
						var rotation = sampleTrack( this.mRotationKeys, time, length, quatlerp );
						matrix.compose( pos, rotation, scale );

						var key = new Virtulous.KeyFrame( time, matrix );
						track.addKey( key );

					}

					track.target = o.findNode( this.mNodeName ).toTHREE();

					var tracks = [ track ];

					if ( o.nodeToBoneMap[ this.mNodeName ] ) {

						for ( var i = 0; i < o.nodeToBoneMap[ this.mNodeName ].length; i ++ ) {

							var t2 = track.clone();
							t2.target = o.nodeToBoneMap[ this.mNodeName ][ i ];
							tracks.push( t2 );

						}

					}

					return tracks;

				};

			}

			function aiAnimation() {

				this.mName = "";
				this.mDuration = 0;
				this.mTicksPerSecond = 0;
				this.mNumChannels = 0;
				this.mChannels = [];
				this.toTHREE = function ( root ) {

					var animationHandle = new Virtulous.Animation();

					for ( var i in this.mChannels ) {

						this.mChannels[ i ].init( this.mTicksPerSecond );

						var tracks = this.mChannels[ i ].toTHREE( root );

						for ( var j in tracks ) {

							tracks[ j ].init();
							animationHandle.addTrack( tracks[ j ] );

						}

					}

					animationHandle.length = Math.max.apply( null, animationHandle.tracks.map( function ( e ) {

						return e.length;

					} ) );
					return animationHandle;

				};

			}

			function aiTexture() {

				this.mWidth = 0;
				this.mHeight = 0;
				this.texAchFormatHint = [];
				this.pcData = [];

			}

			function aiLight() {

				this.mName = '';
				this.mType = 0;
				this.mAttenuationConstant = 0;
				this.mAttenuationLinear = 0;
				this.mAttenuationQuadratic = 0;
				this.mAngleInnerCone = 0;
				this.mAngleOuterCone = 0;
				this.mColorDiffuse = null;
				this.mColorSpecular = null;
				this.mColorAmbient = null;

			}

			function aiCamera() {

				this.mName = '';
				this.mPosition = null;
				this.mLookAt = null;
				this.mUp = null;
				this.mHorizontalFOV = 0;
				this.mClipPlaneNear = 0;
				this.mClipPlaneFar = 0;
				this.mAspect = 0;

			}

			function aiScene() {

				this.mFlags = 0;
				this.mNumMeshes = 0;
				this.mNumMaterials = 0;
				this.mNumAnimations = 0;
				this.mNumTextures = 0;
				this.mNumLights = 0;
				this.mNumCameras = 0;
				this.mRootNode = null;
				this.mMeshes = [];
				this.mMaterials = [];
				this.mAnimations = [];
				this.mLights = [];
				this.mCameras = [];
				this.nodeToBoneMap = {};
				this.findNode = function ( name, root ) {

					if ( ! root ) {

						root = this.mRootNode;

					}

					if ( root.mName == name ) {

						return root;

					}

					for ( var i = 0; i < root.mChildren.length; i ++ ) {

						var ret = this.findNode( name, root.mChildren[ i ] );
						if ( ret ) return ret;

					}

					return null;

				};

				this.toTHREE = function () {

					this.nodeCount = 0;

					markBones( this );

					var o = this.mRootNode.toTHREE( this );

					for ( var i in this.mMeshes )
						this.mMeshes[ i ].hookupSkeletons( this, o );

					if ( this.mAnimations.length > 0 ) {

						var a = this.mAnimations[ 0 ].toTHREE( this );

					}

					return { object: o, animation: a };

				};

			}

			function aiMatrix4() {

				this.elements = [
					[],
					[],
					[],
					[]
				];
				this.toTHREE = function () {

					var m = new THREE.Matrix4();

					for ( var i = 0; i < 4; ++ i ) {

						for ( var i2 = 0; i2 < 4; ++ i2 ) {

							m.elements[ i * 4 + i2 ] = this.elements[ i2 ][ i ];

						}

					}

					return m;

				};

			}

			var littleEndian = true;

			function readFloat( dataview ) {

				var val = dataview.getFloat32( dataview.readOffset, littleEndian );
				dataview.readOffset += 4;
				return val;

			}

			function Read_double( dataview ) {

				var val = dataview.getFloat64( dataview.readOffset, littleEndian );
				dataview.readOffset += 8;
				return val;

			}

			function Read_uint8_t( dataview ) {

				var val = dataview.getUint8( dataview.readOffset );
				dataview.readOffset += 1;
				return val;

			}

			function Read_uint16_t( dataview ) {

				var val = dataview.getUint16( dataview.readOffset, littleEndian );
				dataview.readOffset += 2;
				return val;

			}

			function Read_unsigned_int( dataview ) {

				var val = dataview.getUint32( dataview.readOffset, littleEndian );
				dataview.readOffset += 4;
				return val;

			}

			function Read_uint32_t( dataview ) {

				var val = dataview.getUint32( dataview.readOffset, littleEndian );
				dataview.readOffset += 4;
				return val;

			}

			function Read_aiVector3D( stream ) {

				var v = new aiVector3D();
				v.x = readFloat( stream );
				v.y = readFloat( stream );
				v.z = readFloat( stream );
				return v;

			}

			function Read_aiColor3D( stream ) {

				var c = new aiColor3D();
				c.r = readFloat( stream );
				c.g = readFloat( stream );
				c.b = readFloat( stream );
				return c;

			}

			function Read_aiQuaternion( stream ) {

				var v = new aiQuaternion();
				v.w = readFloat( stream );
				v.x = readFloat( stream );
				v.y = readFloat( stream );
				v.z = readFloat( stream );
				return v;

			}

			function Read_aiString( stream ) {

				var s = new aiString();
				var stringlengthbytes = Read_unsigned_int( stream );
				stream.ReadBytes( s.data, 1, stringlengthbytes );
				return s.toString();

			}

			function Read_aiVertexWeight( stream ) {

				var w = new aiVertexWeight();
				w.mVertexId = Read_unsigned_int( stream );
				w.mWeight = readFloat( stream );
				return w;

			}

			function Read_aiMatrix4x4( stream ) {

				var m = new aiMatrix4();

				for ( var i = 0; i < 4; ++ i ) {

					for ( var i2 = 0; i2 < 4; ++ i2 ) {

						m.elements[ i ][ i2 ] = readFloat( stream );

					}

				}

				return m;

			}

			function Read_aiVectorKey( stream ) {

				var v = new aiVectorKey();
				v.mTime = Read_double( stream );
				v.mValue = Read_aiVector3D( stream );
				return v;

			}

			function Read_aiQuatKey( stream ) {

				var v = new aiQuatKey();
				v.mTime = Read_double( stream );
				v.mValue = Read_aiQuaternion( stream );
				return v;

			}

			function ReadArray_aiVertexWeight( stream, data, size ) {

				for ( var i = 0; i < size; i ++ ) data[ i ] = Read_aiVertexWeight( stream );

			}

			function ReadArray_aiVectorKey( stream, data, size ) {

				for ( var i = 0; i < size; i ++ ) data[ i ] = Read_aiVectorKey( stream );

			}

			function ReadArray_aiQuatKey( stream, data, size ) {

				for ( var i = 0; i < size; i ++ ) data[ i ] = Read_aiQuatKey( stream );

			}

			function ReadBounds( stream, T /*p*/, n ) {

				// not sure what to do here, the data isn't really useful.
				return stream.Seek( sizeof( T ) * n, aiOrigin_CUR );

			}

			function ai_assert( bool ) {

				if ( ! bool )
					throw ( "asset failed" );

			}

			function ReadBinaryNode( stream, parent, depth ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AINODE );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				var node = new aiNode();
				node.mParent = parent;
				node.mDepth = depth;
				node.mName = Read_aiString( stream );
				node.mTransformation = Read_aiMatrix4x4( stream );
				node.mNumChildren = Read_unsigned_int( stream );
				node.mNumMeshes = Read_unsigned_int( stream );

				if ( node.mNumMeshes ) {

					node.mMeshes = [];

					for ( var i = 0; i < node.mNumMeshes; ++ i ) {

						node.mMeshes[ i ] = Read_unsigned_int( stream );

					}

				}

				if ( node.mNumChildren ) {

					node.mChildren = [];

					for ( var i = 0; i < node.mNumChildren; ++ i ) {

						var node2 = ReadBinaryNode( stream, node, depth ++ );
						node.mChildren[ i ] = node2;

					}

				}

				return node;

			}

			// -----------------------------------------------------------------------------------

			function ReadBinaryBone( stream, b ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AIBONE );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				b.mName = Read_aiString( stream );
				b.mNumWeights = Read_unsigned_int( stream );
				b.mOffsetMatrix = Read_aiMatrix4x4( stream );
				// for the moment we write dumb min/max values for the bones, too.
				// maybe I'll add a better, hash-like solution later
				if ( shortened ) {

					ReadBounds( stream, b.mWeights, b.mNumWeights );

				} else {

					// else write as usual

					b.mWeights = [];
					ReadArray_aiVertexWeight( stream, b.mWeights, b.mNumWeights );

				}

				return b;

			}

			function ReadBinaryMesh( stream, mesh ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AIMESH );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				mesh.mPrimitiveTypes = Read_unsigned_int( stream );
				mesh.mNumVertices = Read_unsigned_int( stream );
				mesh.mNumFaces = Read_unsigned_int( stream );
				mesh.mNumBones = Read_unsigned_int( stream );
				mesh.mMaterialIndex = Read_unsigned_int( stream );
				mesh.mNumUVComponents = [];
				// first of all, write bits for all existent vertex components
				var c = Read_unsigned_int( stream );

				if ( c & ASSBIN_MESH_HAS_POSITIONS ) {

					if ( shortened ) {

						ReadBounds( stream, mesh.mVertices, mesh.mNumVertices );

					} else {

						// else write as usual

						mesh.mVertices = [];
						mesh.mVertexBuffer = stream.subArray32( stream.readOffset, stream.readOffset + mesh.mNumVertices * 3 * 4 );
						stream.Seek( mesh.mNumVertices * 3 * 4, aiOrigin_CUR );

					}

				}

				if ( c & ASSBIN_MESH_HAS_NORMALS ) {

					if ( shortened ) {

						ReadBounds( stream, mesh.mNormals, mesh.mNumVertices );

					} else {

						// else write as usual

						mesh.mNormals = [];
						mesh.mNormalBuffer = stream.subArray32( stream.readOffset, stream.readOffset + mesh.mNumVertices * 3 * 4 );
						stream.Seek( mesh.mNumVertices * 3 * 4, aiOrigin_CUR );

					}

				}

				if ( c & ASSBIN_MESH_HAS_TANGENTS_AND_BITANGENTS ) {

					if ( shortened ) {

						ReadBounds( stream, mesh.mTangents, mesh.mNumVertices );
						ReadBounds( stream, mesh.mBitangents, mesh.mNumVertices );

					} else {

						// else write as usual

						mesh.mTangents = [];
						mesh.mTangentBuffer = stream.subArray32( stream.readOffset, stream.readOffset + mesh.mNumVertices * 3 * 4 );
						stream.Seek( mesh.mNumVertices * 3 * 4, aiOrigin_CUR );
						mesh.mBitangents = [];
						mesh.mBitangentBuffer = stream.subArray32( stream.readOffset, stream.readOffset + mesh.mNumVertices * 3 * 4 );
						stream.Seek( mesh.mNumVertices * 3 * 4, aiOrigin_CUR );

					}

				}

				for ( var n = 0; n < AI_MAX_NUMBER_OF_COLOR_SETS; ++ n ) {

					if ( ! ( c & ASSBIN_MESH_HAS_COLOR( n ) ) ) break;

					if ( shortened ) {

						ReadBounds( stream, mesh.mColors[ n ], mesh.mNumVertices );

					} else {

						// else write as usual

						mesh.mColors[ n ] = [];
						mesh.mColorBuffer = stream.subArray32( stream.readOffset, stream.readOffset + mesh.mNumVertices * 4 * 4 );
						stream.Seek( mesh.mNumVertices * 4 * 4, aiOrigin_CUR );

					}

				}

				mesh.mTexCoordsBuffers = [];

				for ( var n = 0; n < AI_MAX_NUMBER_OF_TEXTURECOORDS; ++ n ) {

					if ( ! ( c & ASSBIN_MESH_HAS_TEXCOORD( n ) ) ) break;

					// write number of UV components
					mesh.mNumUVComponents[ n ] = Read_unsigned_int( stream );

					if ( shortened ) {

						ReadBounds( stream, mesh.mTextureCoords[ n ], mesh.mNumVertices );

					} else {

					// else write as usual

						mesh.mTextureCoords[ n ] = [];
						//note that assbin always writes 3d texcoords
						mesh.mTexCoordsBuffers[ n ] = [];

						for ( var uv = 0; uv < mesh.mNumVertices; uv ++ ) {

							mesh.mTexCoordsBuffers[ n ].push( readFloat( stream ) );
							mesh.mTexCoordsBuffers[ n ].push( readFloat( stream ) );
							readFloat( stream );

						}

					}

				}
				// write faces. There are no floating-point calculations involved
				// in these, so we can write a simple hash over the face data
				// to the dump file. We generate a single 32 Bit hash for 512 faces
				// using Assimp's standard hashing function.
				if ( shortened ) {

					Read_unsigned_int( stream );

				} else {

					// else write as usual

					// if there are less than 2^16 vertices, we can simply use 16 bit integers ...
					mesh.mFaces = [];
					mesh.mIndexArray = [];

					for ( var i = 0; i < mesh.mNumFaces; ++ i ) {

						var f = mesh.mFaces[ i ] = new aiFace();
						// BOOST_STATIC_ASSERT(AI_MAX_FACE_INDICES <= 0xffff);
						f.mNumIndices = Read_uint16_t( stream );
						f.mIndices = [];

						for ( var a = 0; a < f.mNumIndices; ++ a ) {

							if ( mesh.mNumVertices < ( 1 << 16 ) ) {

								f.mIndices[ a ] = Read_uint16_t( stream );

							} else {

								f.mIndices[ a ] = Read_unsigned_int( stream );

							}



						}

						if ( f.mNumIndices === 3 ) {

							mesh.mIndexArray.push( f.mIndices[ 0 ] );
							mesh.mIndexArray.push( f.mIndices[ 1 ] );
							mesh.mIndexArray.push( f.mIndices[ 2 ] );

						} else if ( f.mNumIndices === 4 ) {

							mesh.mIndexArray.push( f.mIndices[ 0 ] );
							mesh.mIndexArray.push( f.mIndices[ 1 ] );
							mesh.mIndexArray.push( f.mIndices[ 2 ] );
							mesh.mIndexArray.push( f.mIndices[ 2 ] );
							mesh.mIndexArray.push( f.mIndices[ 3 ] );
							mesh.mIndexArray.push( f.mIndices[ 0 ] );

						} else {

							throw ( new Error( "Sorry, can't currently triangulate polys. Use the triangulate preprocessor in Assimp." ) );

						}



					}

				}
				// write bones
				if ( mesh.mNumBones ) {

					mesh.mBones = [];

					for ( var a = 0; a < mesh.mNumBones; ++ a ) {

						mesh.mBones[ a ] = new aiBone();
						ReadBinaryBone( stream, mesh.mBones[ a ] );

					}

				}

			}

			function ReadBinaryMaterialProperty( stream, prop ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AIMATERIALPROPERTY );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				prop.mKey = Read_aiString( stream );
				prop.mSemantic = Read_unsigned_int( stream );
				prop.mIndex = Read_unsigned_int( stream );
				prop.mDataLength = Read_unsigned_int( stream );
				prop.mType = Read_unsigned_int( stream );
				prop.mData = [];
				stream.ReadBytes( prop.mData, 1, prop.mDataLength );

			}

			// -----------------------------------------------------------------------------------

			function ReadBinaryMaterial( stream, mat ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AIMATERIAL );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				mat.mNumAllocated = mat.mNumProperties = Read_unsigned_int( stream );

				if ( mat.mNumProperties ) {

					if ( mat.mProperties ) {

						delete mat.mProperties;

					}

					mat.mProperties = [];

					for ( var i = 0; i < mat.mNumProperties; ++ i ) {

						mat.mProperties[ i ] = new aiMaterialProperty();
						ReadBinaryMaterialProperty( stream, mat.mProperties[ i ] );

					}

				}

			}
			// -----------------------------------------------------------------------------------
			function ReadBinaryNodeAnim( stream, nd ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AINODEANIM );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				nd.mNodeName = Read_aiString( stream );
				nd.mNumPositionKeys = Read_unsigned_int( stream );
				nd.mNumRotationKeys = Read_unsigned_int( stream );
				nd.mNumScalingKeys = Read_unsigned_int( stream );
				nd.mPreState = Read_unsigned_int( stream );
				nd.mPostState = Read_unsigned_int( stream );

				if ( nd.mNumPositionKeys ) {

					if ( shortened ) {

						ReadBounds( stream, nd.mPositionKeys, nd.mNumPositionKeys );

					} else {

						// else write as usual

						nd.mPositionKeys = [];
						ReadArray_aiVectorKey( stream, nd.mPositionKeys, nd.mNumPositionKeys );

					}

				}

				if ( nd.mNumRotationKeys ) {

					if ( shortened ) {

						ReadBounds( stream, nd.mRotationKeys, nd.mNumRotationKeys );

					} else {

			 			// else write as usual

						nd.mRotationKeys = [];
						ReadArray_aiQuatKey( stream, nd.mRotationKeys, nd.mNumRotationKeys );

					}

				}

				if ( nd.mNumScalingKeys ) {

					if ( shortened ) {

						ReadBounds( stream, nd.mScalingKeys, nd.mNumScalingKeys );

					} else {

		 				// else write as usual

						nd.mScalingKeys = [];
						ReadArray_aiVectorKey( stream, nd.mScalingKeys, nd.mNumScalingKeys );

					}

				}

			}
			// -----------------------------------------------------------------------------------
			function ReadBinaryAnim( stream, anim ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AIANIMATION );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				anim.mName = Read_aiString( stream );
				anim.mDuration = Read_double( stream );
				anim.mTicksPerSecond = Read_double( stream );
				anim.mNumChannels = Read_unsigned_int( stream );

				if ( anim.mNumChannels ) {

					anim.mChannels = [];

					for ( var a = 0; a < anim.mNumChannels; ++ a ) {

						anim.mChannels[ a ] = new aiNodeAnim();
						ReadBinaryNodeAnim( stream, anim.mChannels[ a ] );

					}

				}

			}

			function ReadBinaryTexture( stream, tex ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AITEXTURE );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				tex.mWidth = Read_unsigned_int( stream );
				tex.mHeight = Read_unsigned_int( stream );
				stream.ReadBytes( tex.achFormatHint, 1, 4 );

				if ( ! shortened ) {

					if ( ! tex.mHeight ) {

						tex.pcData = [];
						stream.ReadBytes( tex.pcData, 1, tex.mWidth );

					} else {

						tex.pcData = [];
						stream.ReadBytes( tex.pcData, 1, tex.mWidth * tex.mHeight * 4 );

					}

				}

			}
			// -----------------------------------------------------------------------------------
			function ReadBinaryLight( stream, l ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AILIGHT );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				l.mName = Read_aiString( stream );
				l.mType = Read_unsigned_int( stream );

				if ( l.mType != aiLightSource_DIRECTIONAL ) {

					l.mAttenuationConstant = readFloat( stream );
					l.mAttenuationLinear = readFloat( stream );
					l.mAttenuationQuadratic = readFloat( stream );

				}

				l.mColorDiffuse = Read_aiColor3D( stream );
				l.mColorSpecular = Read_aiColor3D( stream );
				l.mColorAmbient = Read_aiColor3D( stream );

				if ( l.mType == aiLightSource_SPOT ) {

					l.mAngleInnerCone = readFloat( stream );
					l.mAngleOuterCone = readFloat( stream );

				}

			}
			// -----------------------------------------------------------------------------------
			function ReadBinaryCamera( stream, cam ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AICAMERA );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				cam.mName = Read_aiString( stream );
				cam.mPosition = Read_aiVector3D( stream );
				cam.mLookAt = Read_aiVector3D( stream );
				cam.mUp = Read_aiVector3D( stream );
				cam.mHorizontalFOV = readFloat( stream );
				cam.mClipPlaneNear = readFloat( stream );
				cam.mClipPlaneFar = readFloat( stream );
				cam.mAspect = readFloat( stream );

			}

			function ReadBinaryScene( stream, scene ) {

				var chunkID = Read_uint32_t( stream );
				ai_assert( chunkID == ASSBIN_CHUNK_AISCENE );
				/*uint32_t size =*/
				Read_uint32_t( stream );
				scene.mFlags = Read_unsigned_int( stream );
				scene.mNumMeshes = Read_unsigned_int( stream );
				scene.mNumMaterials = Read_unsigned_int( stream );
				scene.mNumAnimations = Read_unsigned_int( stream );
				scene.mNumTextures = Read_unsigned_int( stream );
				scene.mNumLights = Read_unsigned_int( stream );
				scene.mNumCameras = Read_unsigned_int( stream );
				// Read node graph
				scene.mRootNode = new aiNode();
				scene.mRootNode = ReadBinaryNode( stream, null, 0 );
				// Read all meshes
				if ( scene.mNumMeshes ) {

					scene.mMeshes = [];

					for ( var i = 0; i < scene.mNumMeshes; ++ i ) {

						scene.mMeshes[ i ] = new aiMesh();
						ReadBinaryMesh( stream, scene.mMeshes[ i ] );

					}

				}
				// Read materials
				if ( scene.mNumMaterials ) {

					scene.mMaterials = [];

					for ( var i = 0; i < scene.mNumMaterials; ++ i ) {

						scene.mMaterials[ i ] = new aiMaterial();
						ReadBinaryMaterial( stream, scene.mMaterials[ i ] );

					}

				}
				// Read all animations
				if ( scene.mNumAnimations ) {

					scene.mAnimations = [];

					for ( var i = 0; i < scene.mNumAnimations; ++ i ) {

						scene.mAnimations[ i ] = new aiAnimation();
						ReadBinaryAnim( stream, scene.mAnimations[ i ] );

					}

				}
				// Read all textures
				if ( scene.mNumTextures ) {

					scene.mTextures = [];

					for ( var i = 0; i < scene.mNumTextures; ++ i ) {

						scene.mTextures[ i ] = new aiTexture();
						ReadBinaryTexture( stream, scene.mTextures[ i ] );

					}

				}
				// Read lights
				if ( scene.mNumLights ) {

					scene.mLights = [];

					for ( var i = 0; i < scene.mNumLights; ++ i ) {

						scene.mLights[ i ] = new aiLight();
						ReadBinaryLight( stream, scene.mLights[ i ] );

					}

				}
				// Read cameras
				if ( scene.mNumCameras ) {

					scene.mCameras = [];

					for ( var i = 0; i < scene.mNumCameras; ++ i ) {

						scene.mCameras[ i ] = new aiCamera();
						ReadBinaryCamera( stream, scene.mCameras[ i ] );

					}

				}

			}
			var aiOrigin_CUR = 0;
			var aiOrigin_BEG = 1;

			function extendStream( stream ) {

				stream.readOffset = 0;
				stream.Seek = function ( off, ori ) {

					if ( ori == aiOrigin_CUR ) {

						stream.readOffset += off;

					}
					if ( ori == aiOrigin_BEG ) {

						stream.readOffset = off;

					}

				};

				stream.ReadBytes = function ( buff, size, n ) {

					var bytes = size * n;
					for ( var i = 0; i < bytes; i ++ )
						buff[ i ] = Read_uint8_t( this );

				};

				stream.subArray32 = function ( start, end ) {

					var buff = this.buffer;
					var newbuff = buff.slice( start, end );
					return new Float32Array( newbuff );

				};

				stream.subArrayUint16 = function ( start, end ) {

					var buff = this.buffer;
					var newbuff = buff.slice( start, end );
					return new Uint16Array( newbuff );

				};

				stream.subArrayUint8 = function ( start, end ) {

					var buff = this.buffer;
					var newbuff = buff.slice( start, end );
					return new Uint8Array( newbuff );

				};

				stream.subArrayUint32 = function ( start, end ) {

					var buff = this.buffer;
					var newbuff = buff.slice( start, end );
					return new Uint32Array( newbuff );

				};

			}

			var shortened, compressed;

			function InternReadFile( pFiledata ) {

				var pScene = new aiScene();
				var stream = new DataView( pFiledata );
				extendStream( stream );
				stream.Seek( 44, aiOrigin_CUR ); // signature
				/*unsigned int versionMajor =*/
				var versionMajor = Read_unsigned_int( stream );
				/*unsigned int versionMinor =*/
				var versionMinor = Read_unsigned_int( stream );
				/*unsigned int versionRevision =*/
				var versionRevision = Read_unsigned_int( stream );
				/*unsigned int compileFlags =*/
				var compileFlags = Read_unsigned_int( stream );
				shortened = Read_uint16_t( stream ) > 0;
				compressed = Read_uint16_t( stream ) > 0;
				if ( shortened )
					throw "Shortened binaries are not supported!";
				stream.Seek( 256, aiOrigin_CUR ); // original filename
				stream.Seek( 128, aiOrigin_CUR ); // options
				stream.Seek( 64, aiOrigin_CUR ); // padding
				if ( compressed ) {

					var uncompressedSize = Read_uint32_t( stream );
					var compressedSize = stream.FileSize() - stream.Tell();
					var compressedData = [];
					stream.Read( compressedData, 1, compressedSize );
					var uncompressedData = [];
					uncompress( uncompressedData, uncompressedSize, compressedData, compressedSize );
					var buff = new ArrayBuffer( uncompressedData );
					ReadBinaryScene( buff, pScene );

				} else {

					ReadBinaryScene( stream, pScene );
					return pScene.toTHREE();

				}

			}

			return InternReadFile( buffer );

		}

	};

	/**
	 * @author Rich Tibbett / https://github.com/richtr
	 * @author mrdoob / http://mrdoob.com/
	 * @author Tony Parisi / http://www.tonyparisi.com/
	 * @author Takahiro / https://github.com/takahirox
	 * @author Don McCurdy / https://www.donmccurdy.com
	 */

	THREE.GLTFLoader = ( function () {

		function GLTFLoader( manager ) {

			this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

		}

		GLTFLoader.prototype = {

			constructor: GLTFLoader,

			crossOrigin: 'Anonymous',

			load: function ( url, onLoad, onProgress, onError ) {

				var scope = this;

				var path = this.path !== undefined ? this.path : THREE.LoaderUtils.extractUrlBase( url );

				var loader = new THREE.FileLoader( scope.manager );

				loader.setResponseType( 'arraybuffer' );

				loader.load( url, function ( data ) {

					try {

						scope.parse( data, path, onLoad, onError );

					} catch ( e ) {

						if ( onError !== undefined ) {

							onError( e );

						} else {

							throw e;

						}

					}

				}, onProgress, onError );

			},

			setCrossOrigin: function ( value ) {

				this.crossOrigin = value;
				return this;

			},

			setPath: function ( value ) {

				this.path = value;
				return this;

			},

			parse: function ( data, path, onLoad, onError ) {

				var content;
				var extensions = {};

				if ( typeof data === 'string' ) {

					content = data;

				} else {

					var magic = THREE.LoaderUtils.decodeText( new Uint8Array( data, 0, 4 ) );

					if ( magic === BINARY_EXTENSION_HEADER_MAGIC ) {

						try {

							extensions[ EXTENSIONS.KHR_BINARY_GLTF ] = new GLTFBinaryExtension( data );

						} catch ( error ) {

							if ( onError ) onError( error );
							return;

						}

						content = extensions[ EXTENSIONS.KHR_BINARY_GLTF ].content;

					} else {

						content = THREE.LoaderUtils.decodeText( new Uint8Array( data ) );

					}

				}

				var json = JSON.parse( content );

				if ( json.asset === undefined || json.asset.version[ 0 ] < 2 ) {

					if ( onError ) onError( new Error( 'THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported. Use LegacyGLTFLoader instead.' ) );
					return;

				}

				if ( json.extensionsUsed ) {

					if ( json.extensionsUsed.indexOf( EXTENSIONS.KHR_LIGHTS ) >= 0 ) {

						extensions[ EXTENSIONS.KHR_LIGHTS ] = new GLTFLightsExtension( json );

					}

					if ( json.extensionsUsed.indexOf( EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ) >= 0 ) {

						extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ] = new GLTFMaterialsPbrSpecularGlossinessExtension();

					}

				}

				console.time( 'GLTFLoader' );

				var parser = new GLTFParser( json, extensions, {

					path: path || this.path || '',
					crossOrigin: this.crossOrigin,
					manager: this.manager

				} );

				parser.parse( function ( scene, scenes, cameras, animations, asset ) {

					console.timeEnd( 'GLTFLoader' );

					var glTF = {
						scene: scene,
						scenes: scenes,
						cameras: cameras,
						animations: animations,
						asset: asset
					};

					onLoad( glTF );

				}, onError );

			}

		};

		/* GLTFREGISTRY */

		function GLTFRegistry() {

			var objects = {};

			return	{

				get: function ( key ) {

					return objects[ key ];

				},

				add: function ( key, object ) {

					objects[ key ] = object;

				},

				remove: function ( key ) {

					delete objects[ key ];

				},

				removeAll: function () {

					objects = {};

				}

			};

		}

		/*********************************/
		/********** EXTENSIONS ***********/
		/*********************************/

		var EXTENSIONS = {
			KHR_BINARY_GLTF: 'KHR_binary_glTF',
			KHR_LIGHTS: 'KHR_lights',
			KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness'
		};

		/**
		 * Lights Extension
		 *
		 * Specification: PENDING
		 */
		function GLTFLightsExtension( json ) {

			this.name = EXTENSIONS.KHR_LIGHTS;

			this.lights = {};

			var extension = ( json.extensions && json.extensions[ EXTENSIONS.KHR_LIGHTS ] ) || {};
			var lights = extension.lights || {};

			for ( var lightId in lights ) {

				var light = lights[ lightId ];
				var lightNode;

				var color = new THREE.Color().fromArray( light.color );

				switch ( light.type ) {

					case 'directional':
						lightNode = new THREE.DirectionalLight( color );
						lightNode.position.set( 0, 0, 1 );
						break;

					case 'point':
						lightNode = new THREE.PointLight( color );
						break;

					case 'spot':
						lightNode = new THREE.SpotLight( color );
						lightNode.position.set( 0, 0, 1 );
						break;

					case 'ambient':
						lightNode = new THREE.AmbientLight( color );
						break;

				}

				if ( lightNode ) {

					if ( light.constantAttenuation !== undefined ) {

						lightNode.intensity = light.constantAttenuation;

					}

					if ( light.linearAttenuation !== undefined ) {

						lightNode.distance = 1 / light.linearAttenuation;

					}

					if ( light.quadraticAttenuation !== undefined ) {

						lightNode.decay = light.quadraticAttenuation;

					}

					if ( light.fallOffAngle !== undefined ) {

						lightNode.angle = light.fallOffAngle;

					}

					if ( light.fallOffExponent !== undefined ) {

						console.warn( 'THREE.GLTFLoader:: light.fallOffExponent not currently supported.' );

					}

					lightNode.name = light.name || ( 'light_' + lightId );
					this.lights[ lightId ] = lightNode;

				}

			}

		}
		var BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
		var BINARY_EXTENSION_HEADER_LENGTH = 12;
		var BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 };

		function GLTFBinaryExtension( data ) {

			this.name = EXTENSIONS.KHR_BINARY_GLTF;
			this.content = null;
			this.body = null;

			var headerView = new DataView( data, 0, BINARY_EXTENSION_HEADER_LENGTH );

			this.header = {
				magic: THREE.LoaderUtils.decodeText( new Uint8Array( data.slice( 0, 4 ) ) ),
				version: headerView.getUint32( 4, true ),
				length: headerView.getUint32( 8, true )
			};

			if ( this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC ) {

				throw new Error( 'THREE.GLTFLoader: Unsupported glTF-Binary header.' );

			} else if ( this.header.version < 2.0 ) {

				throw new Error( 'THREE.GLTFLoader: Legacy binary file detected. Use LegacyGLTFLoader instead.' );

			}

			var chunkView = new DataView( data, BINARY_EXTENSION_HEADER_LENGTH );
			var chunkIndex = 0;

			while ( chunkIndex < chunkView.byteLength ) {

				var chunkLength = chunkView.getUint32( chunkIndex, true );
				chunkIndex += 4;

				var chunkType = chunkView.getUint32( chunkIndex, true );
				chunkIndex += 4;

				if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON ) {

					var contentArray = new Uint8Array( data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength );
					this.content = THREE.LoaderUtils.decodeText( contentArray );

				} else if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN ) {

					var byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
					this.body = data.slice( byteOffset, byteOffset + chunkLength );

				}

				// Clients must ignore chunks with unknown types.

				chunkIndex += chunkLength;

			}

			if ( this.content === null ) {

				throw new Error( 'THREE.GLTFLoader: JSON content not found.' );

			}

		}

		/**
		 * Specular-Glossiness Extension
		 *
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness
		 */
		function GLTFMaterialsPbrSpecularGlossinessExtension() {

			return {

				name: EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS,

				specularGlossinessParams: [
					'color',
					'map',
					'lightMap',
					'lightMapIntensity',
					'aoMap',
					'aoMapIntensity',
					'emissive',
					'emissiveIntensity',
					'emissiveMap',
					'bumpMap',
					'bumpScale',
					'normalMap',
					'displacementMap',
					'displacementScale',
					'displacementBias',
					'specularMap',
					'specular',
					'glossinessMap',
					'glossiness',
					'alphaMap',
					'envMap',
					'envMapIntensity',
					'refractionRatio',
				],

				getMaterialType: function () {

					return THREE.ShaderMaterial;

				},

				extendParams: function ( params, material, parser ) {

					var pbrSpecularGlossiness = material.extensions[ this.name ];

					var shader = THREE.ShaderLib[ 'standard' ];

					var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

					var specularMapParsFragmentChunk = [
						'#ifdef USE_SPECULARMAP',
						'	uniform sampler2D specularMap;',
						'#endif'
					].join( '\n' );

					var glossinessMapParsFragmentChunk = [
						'#ifdef USE_GLOSSINESSMAP',
						'	uniform sampler2D glossinessMap;',
						'#endif'
					].join( '\n' );

					var specularMapFragmentChunk = [
						'vec3 specularFactor = specular;',
						'#ifdef USE_SPECULARMAP',
						'	vec4 texelSpecular = texture2D( specularMap, vUv );',
						'	texelSpecular = sRGBToLinear( texelSpecular );',
						'	// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture',
						'	specularFactor *= texelSpecular.rgb;',
						'#endif'
					].join( '\n' );

					var glossinessMapFragmentChunk = [
						'float glossinessFactor = glossiness;',
						'#ifdef USE_GLOSSINESSMAP',
						'	vec4 texelGlossiness = texture2D( glossinessMap, vUv );',
						'	// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture',
						'	glossinessFactor *= texelGlossiness.a;',
						'#endif'
					].join( '\n' );

					var lightPhysicalFragmentChunk = [
						'PhysicalMaterial material;',
						'material.diffuseColor = diffuseColor.rgb;',
						'material.specularRoughness = clamp( 1.0 - glossinessFactor, 0.04, 1.0 );',
						'material.specularColor = specularFactor.rgb;',
					].join( '\n' );

					var fragmentShader = shader.fragmentShader
						.replace( '#include <specularmap_fragment>', '' )
						.replace( 'uniform float roughness;', 'uniform vec3 specular;' )
						.replace( 'uniform float metalness;', 'uniform float glossiness;' )
						.replace( '#include <roughnessmap_pars_fragment>', specularMapParsFragmentChunk )
						.replace( '#include <metalnessmap_pars_fragment>', glossinessMapParsFragmentChunk )
						.replace( '#include <roughnessmap_fragment>', specularMapFragmentChunk )
						.replace( '#include <metalnessmap_fragment>', glossinessMapFragmentChunk )
						.replace( '#include <lights_physical_fragment>', lightPhysicalFragmentChunk );

					delete uniforms.roughness;
					delete uniforms.metalness;
					delete uniforms.roughnessMap;
					delete uniforms.metalnessMap;

					uniforms.specular = { value: new THREE.Color().setHex( 0x111111 ) };
					uniforms.glossiness = { value: 0.5 };
					uniforms.specularMap = { value: null };
					uniforms.glossinessMap = { value: null };

					params.vertexShader = shader.vertexShader;
					params.fragmentShader = fragmentShader;
					params.uniforms = uniforms;
					params.defines = { 'STANDARD': '' };

					params.color = new THREE.Color( 1.0, 1.0, 1.0 );
					params.opacity = 1.0;

					var pending = [];

					if ( Array.isArray( pbrSpecularGlossiness.diffuseFactor ) ) {

						var array = pbrSpecularGlossiness.diffuseFactor;

						params.color.fromArray( array );
						params.opacity = array[ 3 ];

					}

					if ( pbrSpecularGlossiness.diffuseTexture !== undefined ) {

						pending.push( parser.assignTexture( params, 'map', pbrSpecularGlossiness.diffuseTexture.index ) );

					}

					params.emissive = new THREE.Color( 0.0, 0.0, 0.0 );
					params.glossiness = pbrSpecularGlossiness.glossinessFactor !== undefined ? pbrSpecularGlossiness.glossinessFactor : 1.0;
					params.specular = new THREE.Color( 1.0, 1.0, 1.0 );

					if ( Array.isArray( pbrSpecularGlossiness.specularFactor ) ) {

						params.specular.fromArray( pbrSpecularGlossiness.specularFactor );

					}

					if ( pbrSpecularGlossiness.specularGlossinessTexture !== undefined ) {

						var specGlossIndex = pbrSpecularGlossiness.specularGlossinessTexture.index;
						pending.push( parser.assignTexture( params, 'glossinessMap', specGlossIndex ) );
						pending.push( parser.assignTexture( params, 'specularMap', specGlossIndex ) );

					}

					return Promise.all( pending );

				},

				createMaterial: function ( params ) {

					// setup material properties based on MeshStandardMaterial for Specular-Glossiness

					var material = new THREE.ShaderMaterial( {
						defines: params.defines,
						vertexShader: params.vertexShader,
						fragmentShader: params.fragmentShader,
						uniforms: params.uniforms,
						fog: true,
						lights: true,
						opacity: params.opacity,
						transparent: params.transparent
					} );

					material.isGLTFSpecularGlossinessMaterial = true;

					material.color = params.color;

					material.map = params.map === undefined ? null : params.map;

					material.lightMap = null;
					material.lightMapIntensity = 1.0;

					material.aoMap = params.aoMap === undefined ? null : params.aoMap;
					material.aoMapIntensity = 1.0;

					material.emissive = params.emissive;
					material.emissiveIntensity = 1.0;
					material.emissiveMap = params.emissiveMap === undefined ? null : params.emissiveMap;

					material.bumpMap = params.bumpMap === undefined ? null : params.bumpMap;
					material.bumpScale = 1;

					material.normalMap = params.normalMap === undefined ? null : params.normalMap;
					if ( params.normalScale ) material.normalScale = params.normalScale;

					material.displacementMap = null;
					material.displacementScale = 1;
					material.displacementBias = 0;

					material.specularMap = params.specularMap === undefined ? null : params.specularMap;
					material.specular = params.specular;

					material.glossinessMap = params.glossinessMap === undefined ? null : params.glossinessMap;
					material.glossiness = params.glossiness;

					material.alphaMap = null;

					material.envMap = params.envMap === undefined ? null : params.envMap;
					material.envMapIntensity = 1.0;

					material.refractionRatio = 0.98;

					material.extensions.derivatives = true;

					return material;

				},

				/**
				 * Clones a GLTFSpecularGlossinessMaterial instance. The ShaderMaterial.copy() method can
				 * copy only properties it knows about or inherits, and misses many properties that would
				 * normally be defined by MeshStandardMaterial.
				 *
				 * This method allows GLTFSpecularGlossinessMaterials to be cloned in the process of
				 * loading a glTF model, but cloning later (e.g. by the user) would require these changes
				 * AND also updating `.onBeforeRender` on the parent mesh.
				 *
				 * @param  {THREE.ShaderMaterial} source
				 * @return {THREE.ShaderMaterial}
				 */
				cloneMaterial: function ( source ) {

					var target = source.clone();

					target.isGLTFSpecularGlossinessMaterial = true;

					var params = this.specularGlossinessParams;

					for ( var i = 0, il = params.length; i < il; i ++ ) {

						target[ params[ i ] ] = source[ params[ i ] ];

					}

					return target;

				},

				// Here's based on refreshUniformsCommon() and refreshUniformsStandard() in WebGLRenderer.
				refreshUniforms: function ( renderer, scene, camera, geometry, material, group ) {

					if ( material.isGLTFSpecularGlossinessMaterial !== true ) {

						return;

					}

					var uniforms = material.uniforms;
					var defines = material.defines;

					uniforms.opacity.value = material.opacity;

					uniforms.diffuse.value.copy( material.color );
					uniforms.emissive.value.copy( material.emissive ).multiplyScalar( material.emissiveIntensity );

					uniforms.map.value = material.map;
					uniforms.specularMap.value = material.specularMap;
					uniforms.alphaMap.value = material.alphaMap;

					uniforms.lightMap.value = material.lightMap;
					uniforms.lightMapIntensity.value = material.lightMapIntensity;

					uniforms.aoMap.value = material.aoMap;
					uniforms.aoMapIntensity.value = material.aoMapIntensity;

					// uv repeat and offset setting priorities
					// 1. color map
					// 2. specular map
					// 3. normal map
					// 4. bump map
					// 5. alpha map
					// 6. emissive map

					var uvScaleMap;

					if ( material.map ) {

						uvScaleMap = material.map;

					} else if ( material.specularMap ) {

						uvScaleMap = material.specularMap;

					} else if ( material.displacementMap ) {

						uvScaleMap = material.displacementMap;

					} else if ( material.normalMap ) {

						uvScaleMap = material.normalMap;

					} else if ( material.bumpMap ) {

						uvScaleMap = material.bumpMap;

					} else if ( material.glossinessMap ) {

						uvScaleMap = material.glossinessMap;

					} else if ( material.alphaMap ) {

						uvScaleMap = material.alphaMap;

					} else if ( material.emissiveMap ) {

						uvScaleMap = material.emissiveMap;

					}

					if ( uvScaleMap !== undefined ) {

						// backwards compatibility
						if ( uvScaleMap.isWebGLRenderTarget ) {

							uvScaleMap = uvScaleMap.texture;

						}

						var offset;
						var repeat;

						if ( uvScaleMap.matrix !== undefined ) {

							// > r88.

							if ( uvScaleMap.matrixAutoUpdate === true ) {

								offset = uvScaleMap.offset;
								repeat = uvScaleMap.repeat;
								var rotation = uvScaleMap.rotation;
								var center = uvScaleMap.center;

								uvScaleMap.matrix.setUvTransform( offset.x, offset.y, repeat.x, repeat.y, rotation, center.x, center.y );

							}

							uniforms.uvTransform.value.copy( uvScaleMap.matrix );

						} else {

							// <= r87. Remove when reasonable.

							offset = uvScaleMap.offset;
							repeat = uvScaleMap.repeat;

							uniforms.offsetRepeat.value.set( offset.x, offset.y, repeat.x, repeat.y );

						}

					}

					uniforms.envMap.value = material.envMap;
					uniforms.envMapIntensity.value = material.envMapIntensity;
					uniforms.flipEnvMap.value = ( material.envMap && material.envMap.isCubeTexture ) ? - 1 : 1;

					uniforms.refractionRatio.value = material.refractionRatio;

					uniforms.specular.value.copy( material.specular );
					uniforms.glossiness.value = material.glossiness;

					uniforms.glossinessMap.value = material.glossinessMap;

					uniforms.emissiveMap.value = material.emissiveMap;
					uniforms.bumpMap.value = material.bumpMap;
					uniforms.normalMap.value = material.normalMap;

					uniforms.displacementMap.value = material.displacementMap;
					uniforms.displacementScale.value = material.displacementScale;
					uniforms.displacementBias.value = material.displacementBias;

					if ( uniforms.glossinessMap.value !== null && defines.USE_GLOSSINESSMAP === undefined ) {

						defines.USE_GLOSSINESSMAP = '';
						// set USE_ROUGHNESSMAP to enable vUv
						defines.USE_ROUGHNESSMAP = '';

					}

					if ( uniforms.glossinessMap.value === null && defines.USE_GLOSSINESSMAP !== undefined ) {

						delete defines.USE_GLOSSINESSMAP;
						delete defines.USE_ROUGHNESSMAP;

					}

				}

			};

		}

		/*********************************/
		/********** INTERPOLATION ********/
		/*********************************/

		// Spline Interpolation
		// Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#appendix-c-spline-interpolation
		function GLTFCubicSplineInterpolant( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

			THREE.Interpolant.call( this, parameterPositions, sampleValues, sampleSize, resultBuffer );

		}
		GLTFCubicSplineInterpolant.prototype = Object.create( THREE.Interpolant.prototype );
		GLTFCubicSplineInterpolant.prototype.constructor = GLTFCubicSplineInterpolant;

		GLTFCubicSplineInterpolant.prototype.interpolate_ = function ( i1, t0, t, t1 ) {

			var result = this.resultBuffer;
			var values = this.sampleValues;
			var stride = this.valueSize;

			var stride2 = stride * 2;
			var stride3 = stride * 3;

			var td = t1 - t0;

			var p = ( t - t0 ) / td;
			var pp = p * p;
			var ppp = pp * p;

			var offset1 = i1 * stride3;
			var offset0 = offset1 - stride3;

			var s0 = 2 * ppp - 3 * pp + 1;
			var s1 = ppp - 2 * pp + p;
			var s2 = - 2 * ppp + 3 * pp;
			var s3 = ppp - pp;

			// Layout of keyframe output values for CUBICSPLINE animations:
			//   [ inTangent_1, splineVertex_1, outTangent_1, inTangent_2, splineVertex_2, ... ]
			for ( var i = 0; i !== stride; i ++ ) {

				var p0 = values[ offset0 + i + stride ];        // splineVertex_k
				var m0 = values[ offset0 + i + stride2 ] * td;  // outTangent_k * (t_k+1 - t_k)
				var p1 = values[ offset1 + i + stride ];        // splineVertex_k+1
				var m1 = values[ offset1 + i ] * td;            // inTangent_k+1 * (t_k+1 - t_k)

				result[ i ] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;

			}

			return result;

		};

		/*********************************/
		/********** INTERNALS ************/
		/*********************************/

		/* CONSTANTS */

		var WEBGL_CONSTANTS = {
			FLOAT: 5126,
			//FLOAT_MAT2: 35674,
			FLOAT_MAT3: 35675,
			FLOAT_MAT4: 35676,
			FLOAT_VEC2: 35664,
			FLOAT_VEC3: 35665,
			FLOAT_VEC4: 35666,
			LINEAR: 9729,
			REPEAT: 10497,
			SAMPLER_2D: 35678,
			POINTS: 0,
			LINES: 1,
			LINE_LOOP: 2,
			LINE_STRIP: 3,
			TRIANGLES: 4,
			TRIANGLE_STRIP: 5,
			TRIANGLE_FAN: 6,
			UNSIGNED_BYTE: 5121,
			UNSIGNED_SHORT: 5123
		};

		var WEBGL_TYPE = {
			5126: Number,
			//35674: THREE.Matrix2,
			35675: THREE.Matrix3,
			35676: THREE.Matrix4,
			35664: THREE.Vector2,
			35665: THREE.Vector3,
			35666: THREE.Vector4,
			35678: THREE.Texture
		};

		var WEBGL_COMPONENT_TYPES = {
			5120: Int8Array,
			5121: Uint8Array,
			5122: Int16Array,
			5123: Uint16Array,
			5125: Uint32Array,
			5126: Float32Array
		};

		var WEBGL_FILTERS = {
			9728: THREE.NearestFilter,
			9729: THREE.LinearFilter,
			9984: THREE.NearestMipMapNearestFilter,
			9985: THREE.LinearMipMapNearestFilter,
			9986: THREE.NearestMipMapLinearFilter,
			9987: THREE.LinearMipMapLinearFilter
		};

		var WEBGL_WRAPPINGS = {
			33071: THREE.ClampToEdgeWrapping,
			33648: THREE.MirroredRepeatWrapping,
			10497: THREE.RepeatWrapping
		};

		var WEBGL_TEXTURE_FORMATS = {
			6406: THREE.AlphaFormat,
			6407: THREE.RGBFormat,
			6408: THREE.RGBAFormat,
			6409: THREE.LuminanceFormat,
			6410: THREE.LuminanceAlphaFormat
		};

		var WEBGL_TEXTURE_DATATYPES = {
			5121: THREE.UnsignedByteType,
			32819: THREE.UnsignedShort4444Type,
			32820: THREE.UnsignedShort5551Type,
			33635: THREE.UnsignedShort565Type
		};

		var WEBGL_SIDES = {
			1028: THREE.BackSide, // Culling front
			1029: THREE.FrontSide // Culling back
			//1032: THREE.NoSide   // Culling front and back, what to do?
		};

		var WEBGL_DEPTH_FUNCS = {
			512: THREE.NeverDepth,
			513: THREE.LessDepth,
			514: THREE.EqualDepth,
			515: THREE.LessEqualDepth,
			516: THREE.GreaterEqualDepth,
			517: THREE.NotEqualDepth,
			518: THREE.GreaterEqualDepth,
			519: THREE.AlwaysDepth
		};

		var WEBGL_BLEND_EQUATIONS = {
			32774: THREE.AddEquation,
			32778: THREE.SubtractEquation,
			32779: THREE.ReverseSubtractEquation
		};

		var WEBGL_BLEND_FUNCS = {
			0: THREE.ZeroFactor,
			1: THREE.OneFactor,
			768: THREE.SrcColorFactor,
			769: THREE.OneMinusSrcColorFactor,
			770: THREE.SrcAlphaFactor,
			771: THREE.OneMinusSrcAlphaFactor,
			772: THREE.DstAlphaFactor,
			773: THREE.OneMinusDstAlphaFactor,
			774: THREE.DstColorFactor,
			775: THREE.OneMinusDstColorFactor,
			776: THREE.SrcAlphaSaturateFactor
			// The followings are not supported by Three.js yet
			//32769: CONSTANT_COLOR,
			//32770: ONE_MINUS_CONSTANT_COLOR,
			//32771: CONSTANT_ALPHA,
			//32772: ONE_MINUS_CONSTANT_COLOR
		};

		var WEBGL_TYPE_SIZES = {
			'SCALAR': 1,
			'VEC2': 2,
			'VEC3': 3,
			'VEC4': 4,
			'MAT2': 4,
			'MAT3': 9,
			'MAT4': 16
		};

		var PATH_PROPERTIES = {
			scale: 'scale',
			translation: 'position',
			rotation: 'quaternion',
			weights: 'morphTargetInfluences'
		};

		var INTERPOLATION = {
			CUBICSPLINE: THREE.InterpolateSmooth, // We use custom interpolation GLTFCubicSplineInterpolation for CUBICSPLINE.
			                                      // KeyframeTrack.optimize() can't handle glTF Cubic Spline output values layout,
			                                      // using THREE.InterpolateSmooth for KeyframeTrack instantiation to prevent optimization.
			                                      // See KeyframeTrack.optimize() for the detail.
			LINEAR: THREE.InterpolateLinear,
			STEP: THREE.InterpolateDiscrete
		};

		var ALPHA_MODES = {
			OPAQUE: 'OPAQUE',
			MASK: 'MASK',
			BLEND: 'BLEND'
		};

		/* UTILITY FUNCTIONS */

		function resolveURL( url, path ) {

			// Invalid URL
			if ( typeof url !== 'string' || url === '' ) return '';

			// Absolute URL http://,https://,//
			if ( /^(https?:)?\/\//i.test( url ) ) return url;

			// Data URI
			if ( /^data:.*,.*$/i.test( url ) ) return url;

			// Blob URL
			if ( /^blob:.*$/i.test( url ) ) return url;

			// Relative URL
			return path + url;

		}

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
		 */
		function createDefaultMaterial() {

			return new THREE.MeshStandardMaterial( {
				color: 0xFFFFFF,
				emissive: 0x000000,
				metalness: 1,
				roughness: 1,
				transparent: false,
				depthTest: true,
				side: THREE.FrontSide
			} );

		}

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#morph-targets
		 *
		 * TODO: Implement support for morph targets on TANGENT attribute.
		 *
		 * @param {THREE.Mesh} mesh
		 * @param {GLTF.Mesh} meshDef
		 * @param {GLTF.Primitive} primitiveDef
		 * @param {Array<THREE.BufferAttribute>} accessors
		 */
		function addMorphTargets( mesh, meshDef, primitiveDef, accessors ) {

			var geometry = mesh.geometry;
			var material = mesh.material;

			var targets = primitiveDef.targets;
			var morphAttributes = geometry.morphAttributes;

			morphAttributes.position = [];
			morphAttributes.normal = [];

			material.morphTargets = true;

			for ( var i = 0, il = targets.length; i < il; i ++ ) {

				var target = targets[ i ];
				var attributeName = 'morphTarget' + i;

				var positionAttribute, normalAttribute;

				if ( target.POSITION !== undefined ) {

					// Three.js morph formula is
					//   position
					//     + weight0 * ( morphTarget0 - position )
					//     + weight1 * ( morphTarget1 - position )
					//     ...
					// while the glTF one is
					//   position
					//     + weight0 * morphTarget0
					//     + weight1 * morphTarget1
					//     ...
					// then adding position to morphTarget.
					// So morphTarget value will depend on mesh's position, then cloning attribute
					// for the case if attribute is shared among two or more meshes.

					positionAttribute = cloneBufferAttribute( accessors[ target.POSITION ] );
					var position = geometry.attributes.position;

					for ( var j = 0, jl = positionAttribute.count; j < jl; j ++ ) {

						positionAttribute.setXYZ(
							j,
							positionAttribute.getX( j ) + position.getX( j ),
							positionAttribute.getY( j ) + position.getY( j ),
							positionAttribute.getZ( j ) + position.getZ( j )
						);

					}

				} else if ( geometry.attributes.position ) {

					// Copying the original position not to affect the final position.
					// See the formula above.
					positionAttribute = cloneBufferAttribute( geometry.attributes.position );

				}

				if ( positionAttribute !== undefined ) {

					positionAttribute.name = attributeName;
					morphAttributes.position.push( positionAttribute );

				}

				if ( target.NORMAL !== undefined ) {

					material.morphNormals = true;

					// see target.POSITION's comment

					normalAttribute = cloneBufferAttribute( accessors[ target.NORMAL ] );
					var normal = geometry.attributes.normal;

					for ( var j = 0, jl = normalAttribute.count; j < jl; j ++ ) {

						normalAttribute.setXYZ(
							j,
							normalAttribute.getX( j ) + normal.getX( j ),
							normalAttribute.getY( j ) + normal.getY( j ),
							normalAttribute.getZ( j ) + normal.getZ( j )
						);

					}

				} else if ( geometry.attributes.normal !== undefined ) {

					normalAttribute = cloneBufferAttribute( geometry.attributes.normal );

				}

				if ( normalAttribute !== undefined ) {

					normalAttribute.name = attributeName;
					morphAttributes.normal.push( normalAttribute );

				}

			}

			mesh.updateMorphTargets();

			if ( meshDef.weights !== undefined ) {

				for ( var i = 0, il = meshDef.weights.length; i < il; i ++ ) {

					mesh.morphTargetInfluences[ i ] = meshDef.weights[ i ];

				}

			}

		}

		function isPrimitiveEqual( a, b ) {

			if ( a.indices !== b.indices ) {

				return false;

			}

			var attribA = a.attributes || {};
			var attribB = b.attributes || {};
			var keysA = Object.keys( attribA );
			var keysB = Object.keys( attribB );

			if ( keysA.length !== keysB.length ) {

				return false;

			}

			for ( var i = 0, il = keysA.length; i < il; i ++ ) {

				var key = keysA[ i ];

				if ( attribA[ key ] !== attribB[ key ] ) {

					return false;

				}

			}

			return true;

		}

		function getCachedGeometry( cache, newPrimitive ) {

			for ( var i = 0, il = cache.length; i < il; i ++ ) {

				var cached = cache[ i ];

				if ( isPrimitiveEqual( cached.primitive, newPrimitive ) ) {

					return cached.geometry;

				}

			}

			return null;

		}

		function cloneBufferAttribute( attribute ) {

			if ( attribute.isInterleavedBufferAttribute ) {

				var count = attribute.count;
				var itemSize = attribute.itemSize;
				var array = attribute.array.slice( 0, count * itemSize );

				for ( var i = 0; i < count; ++ i ) {

					array[ i ] = attribute.getX( i );
					if ( itemSize >= 2 ) array[ i + 1 ] = attribute.getY( i );
					if ( itemSize >= 3 ) array[ i + 2 ] = attribute.getZ( i );
					if ( itemSize >= 4 ) array[ i + 3 ] = attribute.getW( i );

				}

				return new THREE.BufferAttribute( array, itemSize, attribute.normalized );

			}

			return attribute.clone();

		}

		/* GLTF PARSER */

		function GLTFParser( json, extensions, options ) {

			this.json = json || {};
			this.extensions = extensions || {};
			this.options = options || {};

			// loader object cache
			this.cache = new GLTFRegistry();

			// BufferGeometry caching
			this.primitiveCache = [];

			this.textureLoader = new THREE.TextureLoader( this.options.manager );
			this.textureLoader.setCrossOrigin( this.options.crossOrigin );

			this.fileLoader = new THREE.FileLoader( this.options.manager );
			this.fileLoader.setResponseType( 'arraybuffer' );

		}

		GLTFParser.prototype.parse = function ( onLoad, onError ) {

			var json = this.json;

			// Clear the loader cache
			this.cache.removeAll();

			// Mark the special nodes/meshes in json for efficient parse
			this.markDefs();

			// Fire the callback on complete
			this.getMultiDependencies( [

				'scene',
				'animation',
				'camera'

			] ).then( function ( dependencies ) {

				var scenes = dependencies.scenes || [];
				var scene = scenes[ json.scene || 0 ];
				var animations = dependencies.animations || [];
				var asset = json.asset;
				var cameras = dependencies.cameras || [];

				onLoad( scene, scenes, cameras, animations, asset );

			} ).catch( onError );

		};

		/**
		 * Marks the special nodes/meshes in json for efficient parse.
		 */
		GLTFParser.prototype.markDefs = function () {

			var nodeDefs = this.json.nodes || [];
			var skinDefs = this.json.skins || [];
			var meshDefs = this.json.meshes || [];

			var meshReferences = {};
			var meshUses = {};

			// Nothing in the node definition indicates whether it is a Bone or an
			// Object3D. Use the skins' joint references to mark bones.
			for ( var skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex ++ ) {

				var joints = skinDefs[ skinIndex ].joints;

				for ( var i = 0, il = joints.length; i < il; i ++ ) {

					nodeDefs[ joints[ i ] ].isBone = true;

				}

			}

			// Meshes can (and should) be reused by multiple nodes in a glTF asset. To
			// avoid having more than one THREE.Mesh with the same name, count
			// references and rename instances below.
			//
			// Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
			for ( var nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex ++ ) {

				var nodeDef = nodeDefs[ nodeIndex ];

				if ( nodeDef.mesh !== undefined ) {

					if ( meshReferences[ nodeDef.mesh ] === undefined ) {

						meshReferences[ nodeDef.mesh ] = meshUses[ nodeDef.mesh ] = 0;

					}

					meshReferences[ nodeDef.mesh ] ++;

					// Nothing in the mesh definition indicates whether it is
					// a SkinnedMesh or Mesh. Use the node's mesh reference
					// to mark SkinnedMesh if node has skin.
					if ( nodeDef.skin !== undefined ) {

						meshDefs[ nodeDef.mesh ].isSkinnedMesh = true;

					}

				}

			}

			this.json.meshReferences = meshReferences;
			this.json.meshUses = meshUses;

		};

		/**
		 * Requests the specified dependency asynchronously, with caching.
		 * @param {string} type
		 * @param {number} index
		 * @return {Promise<Object>}
		 */
		GLTFParser.prototype.getDependency = function ( type, index ) {

			var cacheKey = type + ':' + index;
			var dependency = this.cache.get( cacheKey );

			if ( ! dependency ) {

				var fnName = 'load' + type.charAt( 0 ).toUpperCase() + type.slice( 1 );
				dependency = this[ fnName ]( index );
				this.cache.add( cacheKey, dependency );

			}

			return dependency;

		};

		/**
		 * Requests all dependencies of the specified type asynchronously, with caching.
		 * @param {string} type
		 * @return {Promise<Array<Object>>}
		 */
		GLTFParser.prototype.getDependencies = function ( type ) {

			var dependencies = this.cache.get( type );

			if ( ! dependencies ) {

				var parser = this;
				var defs = this.json[ type + ( type === 'mesh' ? 'es' : 's' ) ] || [];

				dependencies = Promise.all( defs.map( function ( def, index ) {

					return parser.getDependency( type, index );

				} ) );

				this.cache.add( type, dependencies );

			}

			return dependencies;

		};

		/**
		 * Requests all multiple dependencies of the specified types asynchronously, with caching.
		 * @param {Array<string>} types
		 * @return {Promise<Object<Array<Object>>>}
		 */
		GLTFParser.prototype.getMultiDependencies = function ( types ) {

			var results = {};
			var pendings = [];

			for ( var i = 0, il = types.length; i < il; i ++ ) {

				var type = types[ i ];
				var value = this.getDependencies( type );

				value = value.then( function ( key, value ) {

					results[ key ] = value;

				}.bind( this, type + ( type === 'mesh' ? 'es' : 's' ) ) );

				pendings.push( value );

			}

			return Promise.all( pendings ).then( function () {

				return results;

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
		 * @param {number} bufferIndex
		 * @return {Promise<ArrayBuffer>}
		 */
		GLTFParser.prototype.loadBuffer = function ( bufferIndex ) {

			var bufferDef = this.json.buffers[ bufferIndex ];
			var loader = this.fileLoader;

			if ( bufferDef.type && bufferDef.type !== 'arraybuffer' ) {

				throw new Error( 'THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.' );

			}

			// If present, GLB container is required to be the first buffer.
			if ( bufferDef.uri === undefined && bufferIndex === 0 ) {

				return Promise.resolve( this.extensions[ EXTENSIONS.KHR_BINARY_GLTF ].body );

			}

			var options = this.options;

			return new Promise( function ( resolve, reject ) {

				loader.load( resolveURL( bufferDef.uri, options.path ), resolve, undefined, function () {

					reject( new Error( 'THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".' ) );

				} );

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
		 * @param {number} bufferViewIndex
		 * @return {Promise<ArrayBuffer>}
		 */
		GLTFParser.prototype.loadBufferView = function ( bufferViewIndex ) {

			var bufferViewDef = this.json.bufferViews[ bufferViewIndex ];

			return this.getDependency( 'buffer', bufferViewDef.buffer ).then( function ( buffer ) {

				var byteLength = bufferViewDef.byteLength || 0;
				var byteOffset = bufferViewDef.byteOffset || 0;
				return buffer.slice( byteOffset, byteOffset + byteLength );

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
		 * @param {number} accessorIndex
		 * @return {Promise<THREE.BufferAttribute|THREE.InterleavedBufferAttribute>}
		 */
		GLTFParser.prototype.loadAccessor = function ( accessorIndex ) {

			var parser = this;
			var json = this.json;

			var accessorDef = this.json.accessors[ accessorIndex ];

			var pendingBufferViews = [];

			if ( accessorDef.bufferView !== undefined ) {

				pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.bufferView ) );

			} else {

				pendingBufferViews.push( null );

			}

			if ( accessorDef.sparse !== undefined ) {

				pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.sparse.indices.bufferView ) );
				pendingBufferViews.push( this.getDependency( 'bufferView', accessorDef.sparse.values.bufferView ) );

			}

			return Promise.all( pendingBufferViews ).then( function ( bufferViews ) {

				var bufferView = bufferViews[ 0 ];

				var itemSize = WEBGL_TYPE_SIZES[ accessorDef.type ];
				var TypedArray = WEBGL_COMPONENT_TYPES[ accessorDef.componentType ];

				// For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
				var elementBytes = TypedArray.BYTES_PER_ELEMENT;
				var itemBytes = elementBytes * itemSize;
				var byteOffset = accessorDef.byteOffset || 0;
				var byteStride = json.bufferViews[ accessorDef.bufferView ].byteStride;
				var normalized = accessorDef.normalized === true;
				var array, bufferAttribute;

				// The buffer is not interleaved if the stride is the item size in bytes.
				if ( byteStride && byteStride !== itemBytes ) {

					var ibCacheKey = 'InterleavedBuffer:' + accessorDef.bufferView + ':' + accessorDef.componentType;
					var ib = parser.cache.get( ibCacheKey );

					if ( ! ib ) {

						// Use the full buffer if it's interleaved.
						array = new TypedArray( bufferView );

						// Integer parameters to IB/IBA are in array elements, not bytes.
						ib = new THREE.InterleavedBuffer( array, byteStride / elementBytes );

						parser.cache.add( ibCacheKey, ib );

					}

					bufferAttribute = new THREE.InterleavedBufferAttribute( ib, itemSize, byteOffset / elementBytes, normalized );

				} else {

					if ( bufferView === null ) {

						array = new TypedArray( accessorDef.count * itemSize );

					} else {

						array = new TypedArray( bufferView, byteOffset, accessorDef.count * itemSize );

					}

					bufferAttribute = new THREE.BufferAttribute( array, itemSize, normalized );

				}

				// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#sparse-accessors
				if ( accessorDef.sparse !== undefined ) {

					var itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
					var TypedArrayIndices = WEBGL_COMPONENT_TYPES[ accessorDef.sparse.indices.componentType ];

					var byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
					var byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;

					var sparseIndices = new TypedArrayIndices( bufferViews[ 1 ], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices );
					var sparseValues = new TypedArray( bufferViews[ 2 ], byteOffsetValues, accessorDef.sparse.count * itemSize );

					if ( bufferView !== null ) {

						// Avoid modifying the original ArrayBuffer, if the bufferView wasn't initialized with zeroes.
						bufferAttribute.setArray( bufferAttribute.array.slice() );

					}

					for ( var i = 0, il = sparseIndices.length; i < il; i ++ ) {

						var index = sparseIndices[ i ];

						bufferAttribute.setX( index, sparseValues[ i * itemSize ] );
						if ( itemSize >= 2 ) bufferAttribute.setY( index, sparseValues[ i * itemSize + 1 ] );
						if ( itemSize >= 3 ) bufferAttribute.setZ( index, sparseValues[ i * itemSize + 2 ] );
						if ( itemSize >= 4 ) bufferAttribute.setW( index, sparseValues[ i * itemSize + 3 ] );
						if ( itemSize >= 5 ) throw new Error( 'THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.' );

					}

				}

				return bufferAttribute;

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
		 * @param {number} textureIndex
		 * @return {Promise<THREE.Texture>}
		 */
		GLTFParser.prototype.loadTexture = function ( textureIndex ) {

			var parser = this;
			var json = this.json;
			var options = this.options;
			var textureLoader = this.textureLoader;

			var URL = window.URL || window.webkitURL;

			var textureDef = json.textures[ textureIndex ];
			var source = json.images[ textureDef.source ];
			var sourceURI = source.uri;
			var isObjectURL = false;

			if ( source.bufferView !== undefined ) {

				// Load binary image data from bufferView, if provided.

				sourceURI = parser.getDependency( 'bufferView', source.bufferView ).then( function ( bufferView ) {

					isObjectURL = true;
					var blob = new Blob( [ bufferView ], { type: source.mimeType } );
					sourceURI = URL.createObjectURL( blob );
					return sourceURI;

				} );

			}

			return Promise.resolve( sourceURI ).then( function ( sourceURI ) {

				// Load Texture resource.

				var loader = THREE.Loader.Handlers.get( sourceURI ) || textureLoader;

				return new Promise( function ( resolve, reject ) {

					loader.load( resolveURL( sourceURI, options.path ), resolve, undefined, reject );

				} );

			} ).then( function ( texture ) {

				// Clean up resources and configure Texture.

				if ( isObjectURL === true ) {

					URL.revokeObjectURL( sourceURI );

				}

				texture.flipY = false;

				if ( textureDef.name !== undefined ) texture.name = textureDef.name;

				texture.format = textureDef.format !== undefined ? WEBGL_TEXTURE_FORMATS[ textureDef.format ] : THREE.RGBAFormat;

				if ( textureDef.internalFormat !== undefined && texture.format !== WEBGL_TEXTURE_FORMATS[ textureDef.internalFormat ] ) {

					console.warn( 'THREE.GLTFLoader: Three.js does not support texture internalFormat which is different from texture format. ' +
												'internalFormat will be forced to be the same value as format.' );

				}

				texture.type = textureDef.type !== undefined ? WEBGL_TEXTURE_DATATYPES[ textureDef.type ] : THREE.UnsignedByteType;

				var samplers = json.samplers || {};
				var sampler = samplers[ textureDef.sampler ] || {};

				texture.magFilter = WEBGL_FILTERS[ sampler.magFilter ] || THREE.LinearFilter;
				texture.minFilter = WEBGL_FILTERS[ sampler.minFilter ] || THREE.LinearMipMapLinearFilter;
				texture.wrapS = WEBGL_WRAPPINGS[ sampler.wrapS ] || THREE.RepeatWrapping;
				texture.wrapT = WEBGL_WRAPPINGS[ sampler.wrapT ] || THREE.RepeatWrapping;

				return texture;

			} );

		};

		/**
		 * Asynchronously assigns a texture to the given material parameters.
		 * @param {Object} materialParams
		 * @param {string} textureName
		 * @param {number} textureIndex
		 * @return {Promise}
		 */
		GLTFParser.prototype.assignTexture = function ( materialParams, textureName, textureIndex ) {

			return this.getDependency( 'texture', textureIndex ).then( function ( texture ) {

				materialParams[ textureName ] = texture;

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
		 * @param {number} materialIndex
		 * @return {Promise<THREE.Material>}
		 */
		GLTFParser.prototype.loadMaterial = function ( materialIndex ) {

			var parser = this;
			var json = this.json;
			var extensions = this.extensions;
			var materialDef = this.json.materials[ materialIndex ];

			var materialType;
			var materialParams = {};
			var materialExtensions = materialDef.extensions || {};

			var pending = [];

			if ( materialExtensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ] ) {

				var sgExtension = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ];
				materialType = sgExtension.getMaterialType( materialDef );
				pending.push( sgExtension.extendParams( materialParams, materialDef, parser ) );

			} else if ( materialDef.pbrMetallicRoughness !== undefined ) {

				// Specification:
				// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#metallic-roughness-material

				materialType = THREE.MeshStandardMaterial;

				var metallicRoughness = materialDef.pbrMetallicRoughness;

				materialParams.color = new THREE.Color( 1.0, 1.0, 1.0 );
				materialParams.opacity = 1.0;

				if ( Array.isArray( metallicRoughness.baseColorFactor ) ) {

					var array = metallicRoughness.baseColorFactor;

					materialParams.color.fromArray( array );
					materialParams.opacity = array[ 3 ];

				}

				if ( metallicRoughness.baseColorTexture !== undefined ) {

					pending.push( parser.assignTexture( materialParams, 'map', metallicRoughness.baseColorTexture.index ) );

				}

				materialParams.metalness = metallicRoughness.metallicFactor !== undefined ? metallicRoughness.metallicFactor : 1.0;
				materialParams.roughness = metallicRoughness.roughnessFactor !== undefined ? metallicRoughness.roughnessFactor : 1.0;

				if ( metallicRoughness.metallicRoughnessTexture !== undefined ) {

					var textureIndex = metallicRoughness.metallicRoughnessTexture.index;
					pending.push( parser.assignTexture( materialParams, 'metalnessMap', textureIndex ) );
					pending.push( parser.assignTexture( materialParams, 'roughnessMap', textureIndex ) );

				}

			} else {

				materialType = THREE.MeshPhongMaterial;

			}

			if ( materialDef.doubleSided === true ) {

				materialParams.side = THREE.DoubleSide;

			}

			var alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;

			if ( alphaMode === ALPHA_MODES.BLEND ) {

				materialParams.transparent = true;

			} else {

				materialParams.transparent = false;

				if ( alphaMode === ALPHA_MODES.MASK ) {

					materialParams.alphaTest = materialDef.alphaCutoff !== undefined ? materialDef.alphaCutoff : 0.5;

				}

			}

			if ( materialDef.normalTexture !== undefined ) {

				pending.push( parser.assignTexture( materialParams, 'normalMap', materialDef.normalTexture.index ) );

				materialParams.normalScale = new THREE.Vector2( 1, 1 );

				if ( materialDef.normalTexture.scale !== undefined ) {

					materialParams.normalScale.set( materialDef.normalTexture.scale, materialDef.normalTexture.scale );

				}

			}

			if ( materialDef.occlusionTexture !== undefined ) {

				pending.push( parser.assignTexture( materialParams, 'aoMap', materialDef.occlusionTexture.index ) );

				if ( materialDef.occlusionTexture.strength !== undefined ) {

					materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;

				}

			}

			if ( materialDef.emissiveFactor !== undefined ) {

				if ( materialType === THREE.MeshBasicMaterial ) {

					materialParams.color = new THREE.Color().fromArray( materialDef.emissiveFactor );

				} else {

					materialParams.emissive = new THREE.Color().fromArray( materialDef.emissiveFactor );

				}

			}

			if ( materialDef.emissiveTexture !== undefined ) {

				if ( materialType === THREE.MeshBasicMaterial ) {

					pending.push( parser.assignTexture( materialParams, 'map', materialDef.emissiveTexture.index ) );

				} else {

					pending.push( parser.assignTexture( materialParams, 'emissiveMap', materialDef.emissiveTexture.index ) );

				}

			}

			return Promise.all( pending ).then( function () {

				var material;

				if ( materialType === THREE.ShaderMaterial ) {

					material = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ].createMaterial( materialParams );

				} else {

					material = new materialType( materialParams );

				}

				if ( materialDef.name !== undefined ) material.name = materialDef.name;

				// Normal map textures use OpenGL conventions:
				// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#materialnormaltexture
				if ( material.normalScale ) {

					material.normalScale.x = - material.normalScale.x;

				}

				// emissiveTexture and baseColorTexture use sRGB encoding.
				if ( material.map ) material.map.encoding = THREE.sRGBEncoding;
				if ( material.emissiveMap ) material.emissiveMap.encoding = THREE.sRGBEncoding;

				if ( materialDef.extras ) material.userData = materialDef.extras;

				return material;

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
		 * @param {Array<Object>} primitives
		 * @return {Promise<Array<THREE.BufferGeometry>>}
		 */
		GLTFParser.prototype.loadGeometries = function ( primitives ) {

			var cache = this.primitiveCache;

			return this.getDependencies( 'accessor' ).then( function ( accessors ) {

				var geometries = [];

				for ( var i = 0, il = primitives.length; i < il; i ++ ) {

					var primitive = primitives[ i ];

					// See if we've already created this geometry
					var cached = getCachedGeometry( cache, primitive );

					if ( cached ) {

						// Use the cached geometry if it exists
						geometries.push( cached );

					} else {

						// Otherwise create a new geometry
						var geometry = new THREE.BufferGeometry();

						var attributes = primitive.attributes;

						for ( var attributeId in attributes ) {

							var attributeEntry = attributes[ attributeId ];

							var bufferAttribute = accessors[ attributeEntry ];

							switch ( attributeId ) {

								case 'POSITION':

									geometry.addAttribute( 'position', bufferAttribute );
									break;

								case 'NORMAL':

									geometry.addAttribute( 'normal', bufferAttribute );
									break;

								case 'TEXCOORD_0':
								case 'TEXCOORD0':
								case 'TEXCOORD':

									geometry.addAttribute( 'uv', bufferAttribute );
									break;

								case 'TEXCOORD_1':

									geometry.addAttribute( 'uv2', bufferAttribute );
									break;

								case 'COLOR_0':
								case 'COLOR0':
								case 'COLOR':

									geometry.addAttribute( 'color', bufferAttribute );
									break;

								case 'WEIGHTS_0':
								case 'WEIGHT': // WEIGHT semantic deprecated.

									geometry.addAttribute( 'skinWeight', bufferAttribute );
									break;

								case 'JOINTS_0':
								case 'JOINT': // JOINT semantic deprecated.

									geometry.addAttribute( 'skinIndex', bufferAttribute );
									break;

							}

						}

						if ( primitive.indices !== undefined ) {

							geometry.setIndex( accessors[ primitive.indices ] );

						}

						// Cache this geometry
						cache.push( {

							primitive: primitive,
							geometry: geometry

						} );

						geometries.push( geometry );

					}

				}

				return geometries;

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
		 * @param {number} meshIndex
		 * @return {Promise<THREE.Group|THREE.Mesh|THREE.SkinnedMesh>}
		 */
		GLTFParser.prototype.loadMesh = function ( meshIndex ) {

			var scope = this;
			var json = this.json;
			var extensions = this.extensions;

			var meshDef = this.json.meshes[ meshIndex ];

			return this.getMultiDependencies( [

				'accessor',
				'material'

			] ).then( function ( dependencies ) {

				var group = new THREE.Group();

				var primitives = meshDef.primitives;

				return scope.loadGeometries( primitives ).then( function ( geometries ) {

					for ( var i = 0, il = primitives.length; i < il; i ++ ) {

						var primitive = primitives[ i ];
						var geometry = geometries[ i ];

						var material = primitive.material === undefined
							? createDefaultMaterial()
							: dependencies.materials[ primitive.material ];

						if ( material.aoMap
								&& geometry.attributes.uv2 === undefined
								&& geometry.attributes.uv !== undefined ) {

							console.log( 'THREE.GLTFLoader: Duplicating UVs to support aoMap.' );
							geometry.addAttribute( 'uv2', new THREE.BufferAttribute( geometry.attributes.uv.array, 2 ) );

						}

						// If the material will be modified later on, clone it now.
						var useVertexColors = geometry.attributes.color !== undefined;
						var useFlatShading = geometry.attributes.normal === undefined;
						var useSkinning = meshDef.isSkinnedMesh === true;
						var useMorphTargets = primitive.targets !== undefined;

						if ( useVertexColors || useFlatShading || useSkinning || useMorphTargets ) {

							if ( material.isGLTFSpecularGlossinessMaterial ) {

								var specGlossExtension = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ];
								material = specGlossExtension.cloneMaterial( material );

							} else {

								material = material.clone();

							}

						}

						if ( useVertexColors ) {

							material.vertexColors = THREE.VertexColors;
							material.needsUpdate = true;

						}

						if ( useFlatShading ) {

							material.flatShading = true;

						}

						var mesh;

						if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLES ||
							primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ||
							primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ||
							primitive.mode === undefined ) {

							if ( useSkinning ) {

								mesh = new THREE.SkinnedMesh( geometry, material );
								material.skinning = true;

							} else {

								mesh = new THREE.Mesh( geometry, material );

							}

							if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ) {

								mesh.drawMode = THREE.TriangleStripDrawMode;

							} else if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ) {

								mesh.drawMode = THREE.TriangleFanDrawMode;

							}

						} else if ( primitive.mode === WEBGL_CONSTANTS.LINES ||
							primitive.mode === WEBGL_CONSTANTS.LINE_STRIP ||
							primitive.mode === WEBGL_CONSTANTS.LINE_LOOP ) {

							var cacheKey = 'LineBasicMaterial:' + material.uuid;

							var lineMaterial = scope.cache.get( cacheKey );

							if ( ! lineMaterial ) {

								lineMaterial = new THREE.LineBasicMaterial();
								THREE.Material.prototype.copy.call( lineMaterial, material );
								lineMaterial.color.copy( material.color );
								lineMaterial.lights = false;  // LineBasicMaterial doesn't support lights yet

								scope.cache.add( cacheKey, lineMaterial );

							}

							material = lineMaterial;

							if ( primitive.mode === WEBGL_CONSTANTS.LINES ) {

								mesh = new THREE.LineSegments( geometry, material );

							} else if ( primitive.mode === WEBGL_CONSTANTS.LINE_STRIP ) {

								mesh = new THREE.Line( geometry, material );

							} else {

								mesh = new THREE.LineLoop( geometry, material );

							}

						} else if ( primitive.mode === WEBGL_CONSTANTS.POINTS ) {

							var cacheKey = 'PointsMaterial:' + material.uuid;

							var pointsMaterial = scope.cache.get( cacheKey );

							if ( ! pointsMaterial ) {

								pointsMaterial = new THREE.PointsMaterial();
								THREE.Material.prototype.copy.call( pointsMaterial, material );
								pointsMaterial.color.copy( material.color );
								pointsMaterial.map = material.map;
								pointsMaterial.lights = false;  // PointsMaterial doesn't support lights yet

								scope.cache.add( cacheKey, pointsMaterial );

							}

							material = pointsMaterial;

							mesh = new THREE.Points( geometry, material );

						} else {

							throw new Error( 'THREE.GLTFLoader: Primitive mode unsupported: ' + primitive.mode );

						}

						mesh.name = meshDef.name || ( 'mesh_' + meshIndex );

						if ( useMorphTargets ) {

							addMorphTargets( mesh, meshDef, primitive, dependencies.accessors );

						}

						if ( meshDef.extras !== undefined ) mesh.userData = meshDef.extras;
						if ( primitive.extras !== undefined ) mesh.geometry.userData = primitive.extras;

						// for Specular-Glossiness.
						if ( material.isGLTFSpecularGlossinessMaterial === true ) {

							mesh.onBeforeRender = extensions[ EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS ].refreshUniforms;

						}

						if ( primitives.length > 1 ) {

							mesh.name += '_' + i;

							group.add( mesh );

						} else {

							return mesh;

						}

					}

					return group;

				} );

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
		 * @param {number} cameraIndex
		 * @return {Promise<THREE.Camera>}
		 */
		GLTFParser.prototype.loadCamera = function ( cameraIndex ) {

			var camera;
			var cameraDef = this.json.cameras[ cameraIndex ];
			var params = cameraDef[ cameraDef.type ];

			if ( ! params ) {

				console.warn( 'THREE.GLTFLoader: Missing camera parameters.' );
				return;

			}

			if ( cameraDef.type === 'perspective' ) {

				var aspectRatio = params.aspectRatio || 1;
				var xfov = params.yfov * aspectRatio;

				camera = new THREE.PerspectiveCamera( THREE.Math.radToDeg( xfov ), aspectRatio, params.znear || 1, params.zfar || 2e6 );

			} else if ( cameraDef.type === 'orthographic' ) {

				camera = new THREE.OrthographicCamera( params.xmag / - 2, params.xmag / 2, params.ymag / 2, params.ymag / - 2, params.znear, params.zfar );

			}

			if ( cameraDef.name !== undefined ) camera.name = cameraDef.name;
			if ( cameraDef.extras ) camera.userData = cameraDef.extras;

			return Promise.resolve( camera );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
		 * @param {number} skinIndex
		 * @return {Promise<Object>}
		 */
		GLTFParser.prototype.loadSkin = function ( skinIndex ) {

			var skinDef = this.json.skins[ skinIndex ];

			var skinEntry = { joints: skinDef.joints };

			if ( skinDef.inverseBindMatrices === undefined ) {

				return Promise.resolve( skinEntry );

			}

			return this.getDependency( 'accessor', skinDef.inverseBindMatrices ).then( function ( accessor ) {

				skinEntry.inverseBindMatrices = accessor;

				return skinEntry;

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
		 * @param {number} animationIndex
		 * @return {Promise<THREE.AnimationClip>}
		 */
		GLTFParser.prototype.loadAnimation = function ( animationIndex ) {

			var json = this.json;

			var animationDef = this.json.animations[ animationIndex ];

			return this.getMultiDependencies( [

				'accessor',
				'node'

			] ).then( function ( dependencies ) {

				var tracks = [];

				for ( var i = 0, il = animationDef.channels.length; i < il; i ++ ) {

					var channel = animationDef.channels[ i ];
					var sampler = animationDef.samplers[ channel.sampler ];

					if ( sampler ) {

						var target = channel.target;
						var name = target.node !== undefined ? target.node : target.id; // NOTE: target.id is deprecated.
						var input = animationDef.parameters !== undefined ? animationDef.parameters[ sampler.input ] : sampler.input;
						var output = animationDef.parameters !== undefined ? animationDef.parameters[ sampler.output ] : sampler.output;

						var inputAccessor = dependencies.accessors[ input ];
						var outputAccessor = dependencies.accessors[ output ];

						var node = dependencies.nodes[ name ];

						if ( node ) {

							node.updateMatrix();
							node.matrixAutoUpdate = true;

							var TypedKeyframeTrack;

							switch ( PATH_PROPERTIES[ target.path ] ) {

								case PATH_PROPERTIES.weights:

									TypedKeyframeTrack = THREE.NumberKeyframeTrack;
									break;

								case PATH_PROPERTIES.rotation:

									TypedKeyframeTrack = THREE.QuaternionKeyframeTrack;
									break;

								case PATH_PROPERTIES.position:
								case PATH_PROPERTIES.scale:
								default:

									TypedKeyframeTrack = THREE.VectorKeyframeTrack;
									break;

							}

							var targetName = node.name ? node.name : node.uuid;

							var interpolation = sampler.interpolation !== undefined ? INTERPOLATION[ sampler.interpolation ] : THREE.InterpolateLinear;

							var targetNames = [];

							if ( PATH_PROPERTIES[ target.path ] === PATH_PROPERTIES.weights ) {

								// node should be THREE.Group here but
								// PATH_PROPERTIES.weights(morphTargetInfluences) should be
								// the property of a mesh object under node.
								// So finding targets here.

								node.traverse( function ( object ) {

									if ( object.isMesh === true && object.material.morphTargets === true ) {

										targetNames.push( object.name ? object.name : object.uuid );

									}

								} );

							} else {

								targetNames.push( targetName );

							}

							// KeyframeTrack.optimize() will modify given 'times' and 'values'
							// buffers before creating a truncated copy to keep. Because buffers may
							// be reused by other tracks, make copies here.
							for ( var j = 0, jl = targetNames.length; j < jl; j ++ ) {

								var track = new TypedKeyframeTrack(
									targetNames[ j ] + '.' + PATH_PROPERTIES[ target.path ],
									THREE.AnimationUtils.arraySlice( inputAccessor.array, 0 ),
									THREE.AnimationUtils.arraySlice( outputAccessor.array, 0 ),
									interpolation
								);

								// Here is the trick to enable custom interpolation.
								// Overrides .createInterpolant in a factory method which creates custom interpolation.
								if ( sampler.interpolation === 'CUBICSPLINE' ) {

									track.createInterpolant = function ( result ) {

										// A CUBICSPLINE keyframe in glTF has three output values for each input value,
										// representing inTangent, splineVertex, and outTangent. As a result, track.getValueSize()
										// must be divided by three to get the interpolant's sampleSize argument.

										return new GLTFCubicSplineInterpolant( this.times, this.values, this.getValueSize() / 3, result );

									};

								}

								tracks.push( track );

							}

						}

					}

				}

				var name = animationDef.name !== undefined ? animationDef.name : 'animation_' + animationIndex;

				return new THREE.AnimationClip( name, undefined, tracks );

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
		 * @param {number} nodeIndex
		 * @return {Promise<THREE.Object3D>}
		 */
		GLTFParser.prototype.loadNode = function ( nodeIndex ) {

			var json = this.json;
			var extensions = this.extensions;

			var meshReferences = this.json.meshReferences;
			var meshUses = this.json.meshUses;

			var nodeDef = this.json.nodes[ nodeIndex ];

			return this.getMultiDependencies( [

				'mesh',
				'skin',
				'camera'

			] ).then( function ( dependencies ) {

				var node;

				if ( nodeDef.isBone === true ) {

					node = new THREE.Bone();

				} else if ( nodeDef.mesh !== undefined ) {

					var mesh = dependencies.meshes[ nodeDef.mesh ];

					node = mesh.clone();

					// for Specular-Glossiness
					if ( mesh.isGroup === true ) {

						for ( var i = 0, il = mesh.children.length; i < il; i ++ ) {

							var child = mesh.children[ i ];

							if ( child.material && child.material.isGLTFSpecularGlossinessMaterial === true ) {

								node.children[ i ].onBeforeRender = child.onBeforeRender;

							}

						}

					} else {

						if ( mesh.material && mesh.material.isGLTFSpecularGlossinessMaterial === true ) {

							node.onBeforeRender = mesh.onBeforeRender;

						}

					}

					if ( meshReferences[ nodeDef.mesh ] > 1 ) {

						node.name += '_instance_' + meshUses[ nodeDef.mesh ] ++;

					}

				} else if ( nodeDef.camera !== undefined ) {

					node = dependencies.cameras[ nodeDef.camera ];

				} else if ( nodeDef.extensions
						 && nodeDef.extensions[ EXTENSIONS.KHR_LIGHTS ]
						 && nodeDef.extensions[ EXTENSIONS.KHR_LIGHTS ].light !== undefined ) {

					var lights = extensions[ EXTENSIONS.KHR_LIGHTS ].lights;
					node = lights[ nodeDef.extensions[ EXTENSIONS.KHR_LIGHTS ].light ];

				} else {

					node = new THREE.Object3D();

				}

				if ( nodeDef.name !== undefined ) {

					node.name = THREE.PropertyBinding.sanitizeNodeName( nodeDef.name );

				}

				if ( nodeDef.extras ) node.userData = nodeDef.extras;

				if ( nodeDef.matrix !== undefined ) {

					var matrix = new THREE.Matrix4();
					matrix.fromArray( nodeDef.matrix );
					node.applyMatrix( matrix );

				} else {

					if ( nodeDef.translation !== undefined ) {

						node.position.fromArray( nodeDef.translation );

					}

					if ( nodeDef.rotation !== undefined ) {

						node.quaternion.fromArray( nodeDef.rotation );

					}

					if ( nodeDef.scale !== undefined ) {

						node.scale.fromArray( nodeDef.scale );

					}

				}

				return node;

			} );

		};

		/**
		 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
		 * @param {number} sceneIndex
		 * @return {Promise<THREE.Scene>}
		 */
		GLTFParser.prototype.loadScene = function () {

			// scene node hierachy builder

			function buildNodeHierachy( nodeId, parentObject, json, allNodes, skins ) {

				var node = allNodes[ nodeId ];
				var nodeDef = json.nodes[ nodeId ];

				// build skeleton here as well

				if ( nodeDef.skin !== undefined ) {

					var meshes = node.isGroup === true ? node.children : [ node ];

					for ( var i = 0, il = meshes.length; i < il; i ++ ) {

						var mesh = meshes[ i ];
						var skinEntry = skins[ nodeDef.skin ];

						var bones = [];
						var boneInverses = [];

						for ( var j = 0, jl = skinEntry.joints.length; j < jl; j ++ ) {

							var jointId = skinEntry.joints[ j ];
							var jointNode = allNodes[ jointId ];

							if ( jointNode ) {

								bones.push( jointNode );

								var mat = new THREE.Matrix4();

								if ( skinEntry.inverseBindMatrices !== undefined ) {

									mat.fromArray( skinEntry.inverseBindMatrices.array, j * 16 );

								}

								boneInverses.push( mat );

							} else {

								console.warn( 'THREE.GLTFLoader: Joint "%s" could not be found.', jointId );

							}

						}

						mesh.bind( new THREE.Skeleton( bones, boneInverses ), mesh.matrixWorld );

					}

				}

				// build node hierachy

				parentObject.add( node );

				if ( nodeDef.children ) {

					var children = nodeDef.children;

					for ( var i = 0, il = children.length; i < il; i ++ ) {

						var child = children[ i ];
						buildNodeHierachy( child, node, json, allNodes, skins );

					}

				}

			}

			return function loadScene( sceneIndex ) {

				var json = this.json;
				var extensions = this.extensions;
				var sceneDef = this.json.scenes[ sceneIndex ];

				return this.getMultiDependencies( [

					'node',
					'skin'

				] ).then( function ( dependencies ) {

					var scene = new THREE.Scene();
					if ( sceneDef.name !== undefined ) scene.name = sceneDef.name;

					if ( sceneDef.extras ) scene.userData = sceneDef.extras;

					var nodeIds = sceneDef.nodes || [];

					for ( var i = 0, il = nodeIds.length; i < il; i ++ ) {

						buildNodeHierachy( nodeIds[ i ], scene, json, dependencies.nodes, dependencies.skins );

					}

					// Ambient lighting, if present, is always attached to the scene root.
					if ( sceneDef.extensions
							 && sceneDef.extensions[ EXTENSIONS.KHR_LIGHTS ]
							 && sceneDef.extensions[ EXTENSIONS.KHR_LIGHTS ].light !== undefined ) {

						var lights = extensions[ EXTENSIONS.KHR_LIGHTS ].lights;
						scene.add( lights[ sceneDef.extensions[ EXTENSIONS.KHR_LIGHTS ].light ] );

					}

					return scene;

				} );

			};

		}();

		return GLTFLoader;

	} )();

}());
