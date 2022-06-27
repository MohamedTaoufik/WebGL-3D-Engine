



const MAX_KEYFRAME = 10


export class Skinning {
    static vs_pars = vs_pars
    static vs_main = vs_main
    constructor(boneCount, animations) {


        const animationsCount = 100
        const maxKeyframe = 10
        const boneCount = 10
        const totalKeyframesLength = animationsCount * maxKeyframe
        let shaderDataAnimations = `
            in vec4 a_weight;
            in uvec4 a_boneNdx;

            struct Bone {
                vec3 position;
                vec4 quaternion;
                vec3 scale;
                int parent;
            };

            struct KeyFrame {
                Bone bones[${boneCount}];
                float time;
            };
            
            const KeyFrame animations[${totalKeyframesLength}] = KeyFrame[${totalKeyframesLength}](`

        for (let i = 0; i < totalKeyframesLength; i++) {
            if (i !== 0) shaderDataAnimations += ','
            shaderDataAnimations += `
                KeyFrame( Bone[${boneCount}](
                    Bone(vec3(0.0, 0.0, 0.0), vec4(0.0, 0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0)),
                    Bone(vec3(0.0, 0.0, 0.0), vec4(0.0, 0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0)),
                    Bone(vec3(0.0, 0.0, 0.0), vec4(0.0, 0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0)),
                    Bone(vec3(0.0, 0.0, 0.0), vec4(0.0, 0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0)),
                    Bone(vec3(0.0, 0.0, 0.0), vec4(0.0, 0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0)),

                    Bone(vec3(0.0, 0.0, 0.0), vec4(0.0, 0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0)),
                    Bone(vec3(0.0, 0.0, 0.0), vec4(0.0, 0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0)),
                    Bone(vec3(0.0, 0.0, 0.0), vec4(0.0, 0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0)),
                    Bone(vec3(0.0, 0.0, 0.0), vec4(0.0, 0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0)),
                    Bone(vec3(0.0, 0.0, 0.0), vec4(0.0, 0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0))
                ), 1.5)`
        }
        shaderDataAnimations += `);`

        this.vs_pars = shaderDataAnimations
        this.vs_main = `
        KeyFrame keyFrames keyFrames[1]
            mat4 bones[4];
            bones[0] = 

            position = (
                bones[a_boneNdx[0]] * position * a_weight[0] +
                bones[a_boneNdx[1]] * position * a_weight[1] +
                bones[a_boneNdx[2]] * position * a_weight[2] +
                bones[a_boneNdx[3]] * position * a_weight[3]);
        `


    }
}









