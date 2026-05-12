Kover._modalElements = [];
function Kover(options) {
    this.opt = Object.assign(
        {
            destroyOnClose: true,
            footer: false,
            closeMethods: ["button", "overlay", "escape"],
            cssClass: [],
        },
        options,
    );

    this.template = document.querySelector(`#${this.opt.templateId}`);
    if (!this.template) {
        console.error(`${this.opt.templateId} is not exist!`);
        return;
    }

    this._footerButtons = [];
    this._modalElements = [];

    this._allowButtonClose = this.opt.closeMethods.includes("button");
    this._allowBackdropClose = this.opt.closeMethods.includes("overlay");
    this._allowEscapeClose = this.opt.closeMethods.includes("escape");
}

Kover.prototype.open = function () {
    if (!this._backdrop) {
        this._build();
    }
    document.body.appendChild(this._backdrop);

    // Reflow and Show modal
    this._backdrop.offsetHeight;
    this._backdrop.classList.add("kover__backdrop--show");

    // Disable scrolling
    document.body.classList.add("kover--no-scroll");
    document.body.style.paddingRight = this._getScrollbarWidth() + "px";

    Kover._modalElements.push(this);

    this._onTransitionEnd(this.opt.onOpen);

    if (this._allowBackdropClose) {
        this._backdrop.onclick = (e) => {
            if (e.target === this._backdrop) {
                this.close();
            }
        };
    }

    if (this._allowEscapeClose) {
        document.addEventListener("keydown", this._handleEscapeKey.bind(this));
    }

    return this._backdrop;
};

Kover.prototype.close = function (destroy = this.opt.destroyOnClose) {
    this._backdrop.classList.remove("kover__backdrop--show");
    Kover._modalElements.pop();

    this._onTransitionEnd(() => {
        if (typeof this.opt.onClose === "function") this.opt.onClose();
        if (destroy) {
            this._backdrop.remove();
            this._backdrop = null;
            this._modalFooter = null;
        }
    });

    document.removeEventListener("keydown", this._handleEscapeKey);

    // Enable scrolling
    if (!Kover._modalElements.length) {
        document.body.classList.remove("kover--no-scroll");
        document.body.style.paddingRight = "";
    }
};

Kover.prototype.destroy = function () {
    this.close(true);
};

Kover.prototype._getScrollbarWidth = function () {
    if (this._scrollbarWidth) return this._scrollbarWidth;

    const div = document.createElement("div");
    Object.assign(div.style, {
        overflow: "scroll",
        position: "absolute",
        top: "-9999px",
    });
    document.body.appendChild(div);
    this._scrollbarWidth = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);

    return this._scrollbarWidth;
};

Kover.prototype._build = function () {
    const content = this.template.content.cloneNode(true);
    this._backdrop = document.createElement("div");
    this._backdrop.classList = "kover__backdrop";

    const container = document.createElement("div");
    container.classList = "kover__container";

    this.opt.cssClass.forEach((className) => {
        if (typeof className === "string") {
            container.classList.add(className);
        }
    });

    if (this._allowButtonClose) {
        const closeBtn = this._createButton("&times;", "kover__close", this.close);
        container.appendChild(closeBtn);
    }

    const modalContent = document.createElement("div");
    modalContent.classList = "kover__content";

    // Append content and elements
    modalContent.appendChild(content);
    container.appendChild(modalContent);

    if (this.opt.footer) {
        this._modalFooter = document.createElement("div");
        this._modalFooter.classList = "kover__footer";
        container.appendChild(this._modalFooter);

        if (this._footerContent) {
            this._modalFooter.innerHTML = this._footerContent;
        }

        this._footerButtons.forEach((button) => {
            this._modalFooter.appendChild(button);
        });
    }

    this._backdrop.appendChild(container);
};

Kover.prototype._onTransitionEnd = function (callback) {
    this._backdrop.ontransitionend = (e) => {
        if (e.propertyName !== "transform") return;
        if (typeof callback === "function") callback();
    };
};

Kover.prototype._handleEscapeKey = function (e) {
    const lastModal = Kover._modalElements[Kover._modalElements.length - 1];
    if (e.key === "Escape" && this === lastModal) {
        this.close();
    }
};

Kover.prototype.setFooterContent = function (html) {
    if (this._modalFooter) {
        this._modalFooter.innerHTML = html;
    }
    this._footerContent = html;
};

Kover.prototype.addFooterButton = function (title, cssClass, callback) {
    const button = this._createButton(title, cssClass, callback);
    this._footerButtons.push(button);
    if (this._modalFooter) {
        this._modalFooter.appendChild(button);
    }
};

Kover.prototype._createButton = function (title, cssClass, callback) {
    const button = document.createElement("button");
    button.classList = cssClass;
    button.innerHTML = title;
    if (typeof callback === "function") {
        button.onclick = () => {
            callback.call(this);
        };
    }
    return button;
};
