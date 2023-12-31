import { vec3, mat4, mat3 } from 'https://cdn.skypack.dev/gl-matrix';

export default class Transform
{
    constructor()
	{
		this.translate = vec3.fromValues( 0, 0, 0);
		this.scale = vec3.fromValues( 1, 1, 1);
		this.rotationAngle = 0;
		this.rotationAxis = vec3.fromValues( 0, 1, 0);

		this.modelTransformMatrix = mat3.create();
		mat3.identity(this.modelTransformMatrix);

		this.mvpMatrix = this.modelTransformMatrix;

		this.tempTranslate = vec3.fromValues(0, 0, 0);
		this.tempX = 0;
		this.tempY = 0;

		this.RotMatrix = mat3.create();
		mat3.identity(this.RotMatrix);
		this.updateMVPMatrix();
	}
    
    getModelMatrix()
	{
		return this.modelTransformMatrix;
	}

	// Keep in mind that modeling transformations are applied to objects in the opposite of the order in which they occur in the code
	updateMVPMatrix()
	{
		mat3.identity(this.modelTransformMatrix);
        mat3.translate(this.modelTransformMatrix, this.modelTransformMatrix, this.translate);
        mat3.scale(this.modelTransformMatrix, this.modelTransformMatrix, this.scale);
		mat3.multiply(this.modelTransformMatrix, this.modelTransformMatrix, this.RotMatrix);
	}

	resetMVPMatrix()
	{
		this.rotationAngle = 0;
		this.rotationAxis = vec3.fromValues(0,0,0);
		this.updateMVPMatrix();
	}
	setRotateTranslate(bigX, bigY)
	{
		this.tempX = bigX;
		this.tempY = bigY;
	}
	setTranslate(translationVec)
	{
		this.translate = translationVec;
	}

	getTranslate()
	{
		return this.translate;
	}

	setScale(scalingVec)
	{
		this.scale = scalingVec;
	}

	getScale()
	{
		return this.scale;
	}

	setRotate(RotMat)
	{
		this.RotMatrix = RotMat;
	}

	getRotate()
	{
		return this.RotMatrix;
	}
};