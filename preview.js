function Preview(spriteCanvas) {
    this.spriteCanvas = spriteCanvas
}

Preview.prototype.init = function () {
    this.grabBag = this.gen();
    this.draw();
};

Preview.prototype.next = function () {
    var next = this.grabBag.shift();
    if (this.grabBag.length === 0) {
        this.grabBag = this.gen();
    }
    this.draw();
    return next;
};

/**
 * Creates a "grab bag" of the 7 tetrominos.
 */
Preview.prototype.gen = function () {
    // Init all pieces to false
    var piecesInBag = [false, false, false, false, false, false, false];
    var grabBag = [];

    while (grabBag.length < 7) {
      selectedPiece = rng.gen() % 7;
      if (!piecesInBag[selectedPiece]) {
        piecesInBag[selectedPiece] = true;
        grabBag.push(selectedPiece);
      }
    }
    console.log(grabBag)
    return grabBag;
};

/**
 * Draws the piece preview.
 */
Preview.prototype.draw = function () {
    clear(previewCtx);
    for (var i = 0; i < this.grabBag.length; i++) {
        if (this.grabBag[i] === 0 || this.grabBag[i] === 3) {
            draw(pieces[this.grabBag[i]].tetro, pieces[this.grabBag[i]].x - 3,
                pieces[this.grabBag[i]].y + 2 + i * 3, previewCtx, void(0), this.spriteCanvas);
        } else {
            draw(pieces[this.grabBag[i]].tetro, pieces[this.grabBag[i]].x - 2.5,
                pieces[this.grabBag[i]].y + 2 + i * 3, previewCtx, void(0), this.spriteCanvas);
        }
    }
};
