/*
 * Copyright 2021, TeamDev. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Redistribution and use in source and/or binary forms, with or without
 * modification, must retain the above copyright notice and the following
 * disclaimer.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * This script contains helper functions for switching between Java/Kotlin source code examples.
 *
 * The selected language will be saved in cookies so that the user can switch between pages.
 *
 * To show tabs in HTML or markdown file use this structure:
 * ```
 * <div class="code-tabs">
 *     <div class="code-tab-content java"
 *          Any Java content here
 *     </div>
 *
 *     <div class="code-tab-content kotlin"
 *          Any Kotlin content here
 *     </div>
 * </div>
 * ```
 *
 * In markdown all tags should be aligned to the left side so that blocks of code
 * will not be broken:
 * ```
 * <div class="code-tabs">
 * <div class="code-tab-content java"
 * Any Java content here
 * </div>
 *
 * <div class="code-tab-content kotlin"
 * Any Kotlin content here
 * </div>
 * </div>
 * ```
 *
 * If it is needed to display a specific paragraph of text or change the title for some
 * language and not display tabs, simply use this:
 * ```
 * <div class="code-tab-content java">
 *     This text will be shown only for the Java language.
 * </div>
 * ```
 */

'use strict';

$(
    function() {
        const cookieCodeLang = 'codeLang';
        const $codeTabs = $('.code-tabs');
        const $codeTabContent = $('.code-tab-content');

        const primaryLang = 'java';
        const secondaryLang = 'kotlin';

        addTabSwitcher();
        initCodeLangSwitcher();

        /**
         * Adds a tab switcher to the DOM.
         */
        function addTabSwitcher() {
            $codeTabs.each(function() {
                const tabBlock = $(this);
                createTab(tabBlock, createTabContainer(tabBlock));
            });
        }

        /**
         * Creates a container for tabs.
         *
         * @param tabBlock a block that contains tabs.
         * @return {jQuery|HTMLElement} tabContainer a container for tabs.
         */
        function createTabContainer(tabBlock) {
            const tabContainer = $('<div class="tabs"></div>');
            tabBlock.prepend(tabContainer);
            return tabContainer;
        }

        /**
         * Creates a tab inside the container for each `code-tab-content` element.
         *
         * @param tabBlock a block that contains tabs.
         * @param tabContainer a container for tabs.
         */
        function createTab(tabBlock, tabContainer) {
            const tabContent = tabBlock.find($codeTabContent);
            tabContent.each(function () {
                const tabName = $(this).attr('class').split(' ')[1];
                const item = $(`<div class="tab ${tabName}">${tabName}</div>`);
                tabContainer.append(item);
            });
        }

        /**
         * Inits a code language switcher.
         *
         * By default, sets the primary code language to the `cookie`.
         * On a tab click switches between code languages.
         */
        function initCodeLangSwitcher() {
            const cookieValue = Cookies.get(cookieCodeLang);

            if (cookieValue == null) {
                setCodeLang(primaryLang);
            } else {
                primaryLang === cookieValue && setCodeLang(primaryLang);
                secondaryLang === cookieValue && setCodeLang(secondaryLang);
            }

            $('.tab').click(function() {
                const lang = $(this).attr('class').split(' ')[1];

                if (lang === primaryLang) {
                    setCodeLang(primaryLang);
                } else {
                    setCodeLang(secondaryLang);
                }
            });
        }

        /**
         * Sets the chosen code language to the `cookie` and adds corresponding
         * CSS classes to the selected tab and content element.
         *
         * The CSS file is located at `_sass/modules/_code-tabs.scss`.
         *
         * @param codeLang a selected code language.
         */
        function setCodeLang(codeLang) {
            Cookies.set(cookieCodeLang, codeLang);
            $('.tab').removeClass('selected');
            $('.tab.' + codeLang).addClass('selected');
            $codeTabContent.removeClass('show');
            $('.code-tab-content.' + codeLang).addClass('show');
        }
    }
);
