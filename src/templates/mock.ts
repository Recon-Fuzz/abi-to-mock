const mockTemplate = `// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract {{contractName}} {
    //<>=============================================================<>
    //||                                                             ||
    //||                    NON-VIEW FUNCTIONS                       ||
    //||                                                             ||
    //<>=============================================================<>
    {{#each functions}}
    {{#unless outputs}}
    // Mock implementation of {{name}}
    function {{name}}({{#each inputs}}{{processType this}}{{#if (isStruct (processType this))}} memory{{/if}} {{#if name}}{{name}}{{else}}arg{{@index}}{{/if}}{{#unless @last}}, {{/unless}}{{/each}}) public {
        
    }

    {{/unless}}
    {{/each}}

    //<>=============================================================<>
    //||                                                             ||
    //||                    SETTER FUNCTIONS                         ||
    //||                                                             ||
    //<>=============================================================<>
    {{#each functions}}
    {{#if outputs}}
    // Function to set return values for {{name}}{{#if overloadIndex}} (overload {{overloadIndex}}){{/if}}
    function set{{capitalize name}}Return{{#if overloadIndex}}{{overloadIndex}}{{/if}}({{#each outputs}}{{processType this}}{{memoryKeyword (processType this)}} _value{{@index}}{{#unless @last}}, {{/unless}}{{/each}}) public {
        {{#each outputs}}
        {{#if (isArrayType (processType this))}}
        delete _{{../name}}Return_{{@index}}{{#if ../overloadIndex}}_{{../overloadIndex}}{{/if}};
        {{#if (isMultiArray (processType this))}}
        {{#if (isFixedArray (processType this))}}
        for(uint i = 0; i < {{getFixedArrayLength (processType this)}}; i++) {
            for(uint j = 0; j < _value{{@index}}[i].length; j++) {
                _{{../name}}Return_{{@index}}{{#if ../overloadIndex}}_{{../overloadIndex}}{{/if}}[i][j] = _value{{@index}}[i][j];
            }
        }
        {{else}}
        for(uint i = 0; i < _value{{@index}}.length; i++) {
            _{{../name}}Return_{{@index}}{{#if ../overloadIndex}}_{{../overloadIndex}}{{/if}}.push();
            for(uint j = 0; j < _value{{@index}}[i].length; j++) {
                _{{../name}}Return_{{@index}}{{#if ../overloadIndex}}_{{../overloadIndex}}{{/if}}[i][j] = _value{{@index}}[i][j];
            }
        }
        {{/if}}
        {{else}}
        {{#if (isFixedArray (processType this))}}
        for(uint i = 0; i < {{getFixedArrayLength (processType this)}}; i++) {
            _{{../name}}Return_{{@index}}{{#if ../overloadIndex}}_{{../overloadIndex}}{{/if}}[i] = _value{{@index}}[i];
        }
        {{else}}
        for(uint i = 0; i < _value{{@index}}.length; i++) {
            _{{../name}}Return_{{@index}}{{#if ../overloadIndex}}_{{../overloadIndex}}{{/if}}.push(_value{{@index}}[i]);
        }
        {{/if}}
        {{/if}}
        {{else}}
        _{{../name}}Return_{{@index}}{{#if ../overloadIndex}}_{{../overloadIndex}}{{/if}} = _value{{@index}};
        {{/if}}
        {{/each}}
    }

    {{/if}}
    {{/each}}

    /*******************************************************************
     *   ⚠️ WARNING ⚠️ WARNING ⚠️ WARNING ⚠️ WARNING ⚠️ WARNING ⚠️  *
     *-----------------------------------------------------------------*
     *      Generally you only need to modify the sections above.      *
     *          The code below handles system operations.              *
     *******************************************************************/

    //<>=============================================================<>
    //||                                                             ||
    //||        ⚠️  STRUCT DEFINITIONS - DO NOT MODIFY  ⚠️          ||
    //||                                                             ||
    //<>=============================================================<>
    {{#each structs}}
    // Struct definition for {{name}}
    struct {{name}} {
        {{#each fields}}
        {{type}} {{name}};
        {{/each}}
    }

    {{/each}}

    //<>=============================================================<>
    //||                                                             ||
    //||        ⚠️  EVENTS DEFINITIONS - DO NOT MODIFY  ⚠️          ||
    //||                                                             ||
    //<>=============================================================<>
    {{#each events}}
    event {{name}}({{#each inputs}}{{processType this}} {{#if name}}{{name}}{{else}}arg{{@index}}{{/if}}{{#unless @last}}, {{/unless}}{{/each}});
    {{/each}}

    //<>=============================================================<>
    //||                                                             ||
    //||         ⚠️  INTERNAL STORAGE - DO NOT MODIFY  ⚠️           ||
    //||                                                             ||
    //<>=============================================================<>
    {{#each functions}}
    {{#each outputs}}
    {{processType this}} private _{{../name}}Return_{{@index}}{{#if ../overloadIndex}}_{{../overloadIndex}}{{/if}};
    {{/each}}
    {{/each}}

    //<>=============================================================<>
    //||                                                             ||
    //||          ⚠️  VIEW FUNCTIONS - DO NOT MODIFY  ⚠️            ||
    //||                                                             ||
    //<>=============================================================<>
    {{#each functions}}
    {{#if outputs}}
    // Mock implementation of {{name}}{{#if overloadIndex}} (overload {{overloadIndex}}){{/if}}
    function {{name}}({{#each inputs}}{{processType this}}{{#if (isStruct (processType this))}} memory{{/if}} {{#if name}}{{name}}{{else}}arg{{@index}}{{/if}}{{#unless @last}}, {{/unless}}{{/each}}) public view returns ({{#each outputs}}{{processType this}}{{#if (isStruct (processType this))}} memory{{/if}}{{#unless @last}}, {{/unless}}{{/each}}) {
        {{#if (hasMultipleOutputs outputs)}}
        return ({{#each outputs}}_{{../name}}Return_{{@index}}{{#if ../overloadIndex}}_{{../overloadIndex}}{{/if}}{{#unless @last}}, {{/unless}}{{/each}});
        {{else}}
        return _{{name}}Return_0{{#if overloadIndex}}_{{overloadIndex}}{{/if}};
        {{/if}}
    }

    {{/if}}
    {{/each}}
}`;

export default mockTemplate;