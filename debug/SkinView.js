



export class SkinView {
    constructor(parent, skin, updates) {
        this.container = document.createElement('div')
        parent.appendChild(this.container)

        const writeBoneInfo = (bone) => {
            this.container.innerHTML += `<br>
            ${bone.name} |
            ${bone.position.x.toFixed(1)} ${bone.position.y.toFixed(1)} ${bone.position.z.toFixed(1)} |
            ${bone.quaternion.x.toFixed(1)} ${bone.quaternion.y.toFixed(1)} ${bone.quaternion.z.toFixed(1)} ${bone.quaternion.w.toFixed(1)} |
            ${bone.scale.x.toFixed(1)} ${bone.scale.y.toFixed(1)} ${bone.scale.z.toFixed(1)}
            `
        }
        const update = () => {
            this.container.innerHTML = ''
            skin.root.traverse(writeBoneInfo)
        }
        updates.add(update)
        this.dispose = () => {
            updates.delete(update)
        }
    }
}








