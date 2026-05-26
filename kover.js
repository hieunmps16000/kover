Kover._modalElements = [];
function Kover(options = {}) {
    if (!options.templateId && !options.content) {
        throw new Error("You must provide one of 'content' or 'templateId'.");
    }

    if (options.templateId && options.content) {
        this.template = null;
        console.warn(
            "Both 'content' and 'templateId' are specified. 'content' will take precedence, and 'templateId' will be ignored.",
        );
    }

    if (options.templateId) {
        this.template = document.querySelector(`#${options.templateId}`);

        if (!this.template) {
            throw new Error(`#${options.templateId} does not exist!`);
        }
    }

    this.opt = Object.assign(
        {
            footer: false,
            enableScrollLock: true,
            destroyOnClose: true,
            cssClass: [],
            cssClassContent: [],
            closeMethods: ["button", "overlay", "escape"],
            scrollLockTarget: () => document.documentElement,
        },
        options,
    );

    this._footerButtons = [];
    this._handleEscapeKey = this._handleEscapeKey.bind(this);

    this._allowButtonClose = this.opt.closeMethods.includes("button");
    this._allowBackdropClose = this.opt.closeMethods.includes("overlay");
    this._allowEscapeClose = this.opt.closeMethods.includes("escape");
}

Kover.prototype._build = function () {
    const contentNode = this.opt.content ? document.createElement("div") : this.template.content.cloneNode(true);

    if (this.opt.content) {
        contentNode.innerHTML = this.opt.content;
    }

    // Create element
    this._backdrop = document.createElement("div");
    this._backdrop.classList = "kover";

    const container = document.createElement("div");
    container.classList = "kover__container";

    this.opt.cssClass.forEach((className) => {
        if (typeof className === "string") {
            container.classList.add(className);
        }
    });

    if (this._allowButtonClose) {
        const closeBtn = this._createButton(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"/></svg>`,
            "kover__close",
            () => {
                this.close();
            },
        );
        container.appendChild(closeBtn);
    }

    this._modalContent = document.createElement("div");
    this._modalContent.classList = "kover__content";

    if (this.opt.cssClassContent.length) {
        this.opt.cssClassContent.forEach((className) => {
            this._modalContent.classList.add(className);
        });
    }

    // Append content and elements
    this._modalContent.appendChild(contentNode);
    container.appendChild(this._modalContent);

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

Kover.prototype._hasScrollbar = (target) => {
    return target.scrollHeight > target.clientHeight;
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

Kover.prototype._createButton = function (title, cssClass, callback) {
    const button = document.createElement("button");
    button.classList = cssClass;
    button.innerHTML = title;
    if (typeof callback === "function") {
        button.onclick = () => {
            callback();
        };
    }
    return button;
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

Kover.prototype.setContent = function (content) {
    this.opt.content = content;
    if (this._modalContent) {
        this._modalContent.innerHTML = this.opt.content;
    }
};

Kover.prototype.open = function () {
    Kover._modalElements.push(this);

    if (!this._backdrop) {
        this._build();
    }
    document.body.appendChild(this._backdrop);

    // Reflow and Show modal
    this._backdrop.offsetHeight;
    this._backdrop.classList.add("kover--show");

    // Disable scrolling
    if (this.opt.enableScrollLock) {
        const target = this.opt.scrollLockTarget();
        const hasScrollbar = this._hasScrollbar(target);
        if (hasScrollbar) {
            target.classList.add("kover--no-scroll");
            const targetPaddingRight = parseInt(getComputedStyle(target).paddingRight);
            target.style.paddingRight = targetPaddingRight + this._getScrollbarWidth() + "px";
        }
    }

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
    Kover._modalElements.pop();
    this._backdrop.classList.remove("kover--show");

    this._onTransitionEnd(() => {
        if (typeof this.opt.onClose === "function") this.opt.onClose();
        if (destroy) {
            this._backdrop.remove();
            this._backdrop = null;
            this._modalFooter = null;
        }
        document.removeEventListener("keydown", this._handleEscapeKey);
    });

    // Enable scrolling
    if (!Kover._modalElements.length && this.opt.enableScrollLock) {
        const target = this.opt.scrollLockTarget();
        const hasScrollbar = this._hasScrollbar(target);
        if (hasScrollbar) {
            target.classList.remove("kover--no-scroll");
            target.style.paddingRight = "";
        }
    }
};

Kover.prototype.destroy = function () {
    this.close(true);
};
