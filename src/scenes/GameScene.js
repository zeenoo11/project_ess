import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Assets will be loaded here later
    }

    create() {
        // UI is currently handled by DOM overlay in index.html
    }

    update() {
    }
}
