import {Pipe, PipeTransform} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
/*
 * Converts newlines into html breaks
*/
@Pipe({ name: 'code' })
export class CodePipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { 

    }

    transform(value: string, args: string[] = []): any {
        var v = value.replace(/(?:\r\n|\r|\n)/g, '<br />');
        var parts = v.split('```');
        for(var i = 1; i < parts.length; i += 2) {
            v = v.replaceAll(parts[i], '<p><pre onmouseover="showElement(this.firstChild.nextSibling)" onmouseout="hideElement(this.firstChild.nextSibling)"><code class="code">' + parts[i] + '</code><button style="display: none" class="mat-focus-indicator mat-raised-button mat-button-base mat-primary code-btn" onclick="onCodeClick(this.previousSibling.innerText)" title="Send the command to Azure Pipelines for execution." cdkOverlayOrigin #trigger="cdkOverlayOrigin">&origof;</button></pre></p>');
        }
        // v = v.replace(/(?<=```)(?<code>.*?)(?=```)/g, '<br/><div style="color: red" onclick="alert(this.innerText)"><br/>$1<br/></div><br/>');
        v = this.linkify(v);
        var html = this.sanitizer.bypassSecurityTrustHtml(v);
        return html;
    }

    linkify(s: string) {
        // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

        // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        // Email addresses
        var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;

        return s
            .replace(urlPattern, '<a href="$&">$&</a>')
            .replace(pseudoUrlPattern, '$1<a href="http://$2">$2</a>')
            .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
    }

}
