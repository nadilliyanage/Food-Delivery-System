const CardType = ({type}) => {
    switch (type) {
        case 'visa':
            return <svg width="140" height="104" viewBox="0 0 140 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_1_87)">
                    <rect x="21.3229" y="21.3229" width="97.3542" height="61.3542" rx="14.5521" fill="white"
                          stroke="#D9D9D9" stroke-width="2.64583"/>
                    <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M50.3579 63.3553H44.2998L39.757 47.1796C39.5414 46.4356 39.0836 45.7778 38.4101 45.4677C36.7295 44.6886 34.8775 44.0685 32.8571 43.7558V43.133H42.6162C43.9631 43.133 44.9733 44.0685 45.1416 45.155L47.4987 56.823L53.5538 43.133H59.4435L50.3579 63.3553ZM62.8107 63.3553H57.0894L61.8006 43.133H67.5219L62.8107 63.3553ZM74.9239 48.7352C75.0923 47.6461 76.1024 47.0233 77.281 47.0233C79.1329 46.8669 81.1503 47.1797 82.8339 47.9561L83.8441 43.6021C82.1605 42.9794 80.3085 42.6667 78.6279 42.6667C73.0749 42.6667 69.0342 45.4677 69.0342 49.3553C69.0342 52.3127 71.8963 53.8656 73.9167 54.8011C76.1024 55.7339 76.9442 56.3567 76.7759 57.2895C76.7759 58.6887 75.0923 59.3114 73.4116 59.3114C71.3913 59.3114 69.3709 58.845 67.5219 58.0659L66.5117 62.4225C68.5321 63.199 70.7178 63.5117 72.7382 63.5117C78.9646 63.6654 82.8339 60.867 82.8339 56.6667C82.8339 51.3773 74.9239 51.0672 74.9239 48.7352ZM102.857 63.3553L98.3143 43.133H93.4348C92.4246 43.133 91.4145 43.7558 91.0778 44.6886L82.6656 63.3553H88.5553L89.7309 60.4006H96.9675L97.6409 63.3553H102.857ZM94.2766 48.5789L95.9573 56.2003H91.2461L94.2766 48.5789Z"
                          fill="#172B85"/>
                </g>
                <defs>
                    <filter id="filter0_d_1_87" x="0" y="0" width="140" height="104" filterUnits="userSpaceOnUse"
                            color-interpolation-filters="sRGB">
                        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                       result="hardAlpha"/>
                        <feOffset/>
                        <feGaussianBlur stdDeviation="10"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_87"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_87" result="shape"/>
                    </filter>
                </defs>
            </svg>;
        case 'mastercard':
            return <svg width="141" height="104" viewBox="0 0 141 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_1_88)">
                    <rect x="21.3229" y="21.3229" width="98.3542" height="61.3542" rx="14.5521" fill="white"
                          stroke="#D9D9D9" stroke-width="2.64583"/>
                    <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M71.2214 65.7518C67.7829 68.4939 63.3225 70.1492 58.4486 70.1492C47.5733 70.1492 38.7571 61.9077 38.7571 51.7413C38.7571 41.5749 47.5733 33.3333 58.4486 33.3333C63.3225 33.3333 67.7829 34.9887 71.2214 37.7307C74.66 34.9887 79.1203 33.3333 83.9943 33.3333C94.8695 33.3333 103.686 41.5749 103.686 51.7413C103.686 61.9077 94.8695 70.1492 83.9943 70.1492C79.1203 70.1492 74.66 68.4939 71.2214 65.7518Z"
                          fill="#ED0006"/>
                    <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M71.2214 65.7518C75.4554 62.3755 78.1401 57.3515 78.1401 51.7413C78.1401 46.1311 75.4554 41.1071 71.2214 37.7307C74.66 34.9887 79.1203 33.3333 83.9943 33.3333C94.8695 33.3333 103.686 41.5749 103.686 51.7413C103.686 61.9077 94.8695 70.1492 83.9943 70.1492C79.1203 70.1492 74.66 68.4939 71.2214 65.7518Z"
                          fill="#F9A000"/>
                    <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M71.2215 65.7518C75.4554 62.3754 78.14 57.3515 78.14 51.7413C78.14 46.1312 75.4554 41.1072 71.2215 37.7308C66.9876 41.1072 64.303 46.1312 64.303 51.7413C64.303 57.3515 66.9876 62.3754 71.2215 65.7518Z"
                          fill="#FF5E00"/>
                </g>
                <defs>
                    <filter id="filter0_d_1_88" x="0" y="0" width="141" height="104" filterUnits="userSpaceOnUse"
                            color-interpolation-filters="sRGB">
                        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                       result="hardAlpha"/>
                        <feOffset/>
                        <feGaussianBlur stdDeviation="10"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_88"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_88" result="shape"/>
                    </filter>
                </defs>
            </svg>;
        case 'amex':
            return
            <svg
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:cc="http://creativecommons.org/ns#"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                xmlns:svg="http://www.w3.org/2000/svg"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
                xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
                width="1000"
                height="997.51703"
                id="svg2"
                version="1.1"
                inkscape:version="0.91 r13725"
                sodipodi:docname="American_Express_2018.svg">
                <defs
                    id="defs4"/>
                <sodipodi:namedview
                    id="base"
                    pagecolor="#ffffff"
                    bordercolor="#666666"
                    borderopacity="1.0"
                    inkscape:pageopacity="0.0"
                    inkscape:pageshadow="2"
                    inkscape:zoom="0.125"
                    inkscape:cx="850.2929"
                    inkscape:cy="357.59411"
                    inkscape:document-units="px"
                    inkscape:current-layer="layer1"
                    showgrid="true"
                    fit-margin-top="0"
                    fit-margin-left="0"
                    fit-margin-right="0"
                    fit-margin-bottom="0"
                    inkscape:window-width="1680"
                    inkscape:window-height="931"
                    inkscape:window-x="0"
                    inkscape:window-y="1"
                    inkscape:window-maximized="1">
                    <inkscape:grid
                        type="xygrid"
                        id="grid2996"
                        empspacing="5"
                        visible="true"
                        enabled="true"
                        snapvisiblegridlinesonly="true"
                        originx="-55.5px"
                        originy="947.50002px"/>
                </sodipodi:namedview>
                <metadata
                    id="metadata7">
                    <rdf:RDF>
                        <cc:Work
                            rdf:about="">
                            <dc:format>image/svg+xml</dc:format>
                            <dc:type
                                rdf:resource="http://purl.org/dc/dcmitype/StillImage"/>
                            <dc:title></dc:title>
                        </cc:Work>
                    </rdf:RDF>
                </metadata>
                <g
                    inkscape:label="Layer 1"
                    inkscape:groupmode="layer"
                    id="layer1"
                    transform="translate(-55.5,-1002.3452)">
                    <path
                        sodipodi:nodetypes="ccccccccccc"
                        inkscape:connector-curvature="0"
                        id="path3078"
                        d="m 55.5,1002.3454 997.5168,0 0,538.4893 -49.3744,77.1475 49.3744,68.6613 0,313.2187 -997.5168,0 0,-507.6304 L 86.358989,1456.744 55.5,1422.7991 Z"
                        style="fill:#016fd0;fill-opacity:1;stroke:none"/>
                    <path
                        sodipodi:nodetypes="cccccccccccccccccccc"
                        inkscape:connector-curvature="0"
                        id="path3082"
                        d="m 249.14015,1697.4441 0,-156.6094 165.82027,0 17.79072,23.1924 18.37901,-23.1924 601.88665,0 0,145.8088 c 0,0 -15.7404,10.644 -33.9449,10.8006 l -333.27706,0 -20.05834,-24.6872 0,24.6872 -65.72965,0 0,-42.1418 c 0,0 -8.97877,5.8825 -28.39026,5.8825 l -22.37277,0 0,36.2593 -99.52024,0 -17.7653,-23.6898 -18.03807,23.6898 z"
                        style="fill:#ffffff;stroke:none"/>
                    <path
                        sodipodi:nodetypes="cccccccccccccccccccccccccccccccccccccc"
                        inkscape:connector-curvature="0"
                        id="path3080"
                        d="m 55.5,1422.7991 37.393125,-87.1766 64.667505,0 21.22103,48.8328 0,-48.8328 80.38767,0 12.63289,35.2949 12.24716,-35.2949 360.8573,0 0,17.7439 c 0,0 18.96995,-17.7439 50.14586,-17.7439 l 117.08499,0.4092 20.85469,48.1937 0,-48.6029 67.27259,0 18.5154,27.6834 0,-27.6834 67.88977,0 0,156.6093 -67.88977,0 -17.74392,-27.7731 0,27.7731 -98.83835,0 -9.93959,-24.6872 -26.57108,0 -9.77781,24.6872 -67.02872,0 c -26.82589,0 -43.97406,-17.3816 -43.97406,-17.3816 l 0,17.3816 -101.06318,0 -20.05835,-24.6872 0,24.6872 -375.80462,0 -9.93274,-24.6872 -26.48635,0 -9.86254,24.6872 -46.1989,0 z"
                        style="fill:#ffffff;stroke:none"/>
                    <path
                        id="path3046"
                        d="m 106.12803,1354.9291 -50.435161,117.2641 32.835892,0 9.305914,-23.4816 54.099665,0 9.2577,23.4816 33.55915,0 -50.38695,-117.2641 -38.23621,0 z m 18.66004,27.2909 16.49028,41.0329 -33.02877,0 16.53849,-41.0329 z"
                        style="fill:#016fd0;fill-opacity:1;stroke:none"
                        inkscape:connector-curvature="0"/>
                    <path
                        sodipodi:nodetypes="cccccccccccccc"
                        inkscape:connector-curvature="0"
                        id="path3048"
                        d="m 198.22282,1472.1735 0,-117.2642 46.66163,0.1733 27.13999,75.6045 26.4901,-75.7778 46.28848,0 0,117.2642 -29.31604,0 0,-86.4052 -31.07562,86.4052 -25.71023,0 -31.16227,-86.4052 0,86.4052 z"
                        style="fill:#016fd0;fill-opacity:1;stroke:none"/>
                    <path
                        sodipodi:nodetypes="ccccccccccccc"
                        inkscape:connector-curvature="0"
                        id="path3050"
                        d="m 364.86136,1472.1735 0,-117.2642 95.66287,0 0,26.2302 -66.03824,0 0,20.0583 64.49529,0 0,24.6872 -64.49529,0 0,20.8298 66.03824,0 0,25.4587 z"
                        style="fill:#016fd0;fill-opacity:1;stroke:none"/>
                    <path
                        id="path3052"
                        d="m 477.49667,1354.9291 0,117.2641 29.31604,0 0,-41.6596 12.34359,0 35.15032,41.6596 35.82536,0 -38.57374,-43.2025 c 15.8309,-1.3359 32.16085,-14.9233 32.16085,-36.0182 0,-24.6765 -19.36827,-38.0434 -40.98459,-38.0434 l -65.23783,0 z m 29.31604,26.2301 33.51093,0 c 8.03881,0 13.88655,6.2882 13.88655,12.3436 0,7.7905 -7.57673,12.3436 -13.45259,12.3436 l -33.94489,0 0,-24.6872 z"
                        style="fill:#016fd0;fill-opacity:1;stroke:none"
                        inkscape:connector-curvature="0"/>
                    <path
                        sodipodi:nodetypes="ccccc"
                        inkscape:connector-curvature="0"
                        id="path3054"
                        d="m 625.61982,1472.1735 -29.93322,0 0,-117.2642 29.93322,0 z"
                        style="fill:#016fd0;fill-opacity:1;stroke:none"/>
                    <path
                        sodipodi:nodetypes="ccccccccccc"
                        inkscape:connector-curvature="0"
                        id="path3056"
                        d="m 696.59549,1472.1735 -6.4611,0 c -31.26172,0 -50.24229,-24.6292 -50.24229,-58.1499 0,-34.3488 18.76806,-59.1143 58.24634,-59.1143 l 32.40194,0 0,27.7731 -33.58657,0 c -16.026,0 -27.35994,12.5067 -27.35994,31.6305 0,22.7096 12.95987,32.2476 31.63047,32.2476 l 7.71474,0 z"
                        style="fill:#016fd0;fill-opacity:1;stroke:none"/>
                    <path
                        inkscape:connector-curvature="0"
                        style="fill:#016fd0;fill-opacity:1;stroke:none"
                        d="m 760.3868,1354.9291 -50.43515,117.2641 32.83589,0 9.30591,-23.4816 54.09967,0 9.25769,23.4816 33.55915,0 -50.38694,-117.2641 -38.23622,0 z m 18.66005,27.2909 16.49027,41.0329 -33.02876,0 16.53849,-41.0329 z"
                        id="path3058"/>
                    <path
                        sodipodi:nodetypes="ccccccccccc"
                        inkscape:connector-curvature="0"
                        id="path3060"
                        d="m 852.43338,1472.1735 0,-117.2642 37.27187,0 47.59035,73.6759 0,-73.6759 29.31604,0 0,117.2642 -36.06644,0 -48.79578,-75.6045 0,75.6045 z"
                        style="fill:#016fd0;fill-opacity:1;stroke:none"/>
                    <path
                        style="fill:#016fd0;fill-opacity:1;stroke:none"
                        d="m 269.1985,1677.3858 0,-117.2642 95.66286,0 0,26.2302 -66.03823,0 0,20.0583 64.49528,0 0,24.6872 -64.49528,0 0,20.8298 66.03823,0 0,25.4587 z"
                        id="path3062"
                        inkscape:connector-curvature="0"
                        sodipodi:nodetypes="ccccccccccccc"/>
                    <path
                        sodipodi:nodetypes="ccccccccccccc"
                        inkscape:connector-curvature="0"
                        id="path3064"
                        d="m 737.94653,1677.3858 0,-117.2642 95.66287,0 0,26.2302 -66.03824,0 0,20.0583 64.1867,0 0,24.6872 -64.1867,0 0,20.8298 66.03824,0 0,25.4587 z"
                        style="fill:#016fd0;fill-opacity:1;stroke:none"/>
                    <path
                        sodipodi:nodetypes="ccccccccccccc"
                        inkscape:connector-curvature="0"
                        id="path3066"
                        d="m 368.57408,1677.3858 46.57779,-57.9089 -47.68678,-59.3553 36.93435,0 28.39991,36.6932 28.49635,-36.6932 35.48784,0 -47.05996,58.6321 46.66353,58.6321 -36.92851,0 -27.57537,-36.1148 -26.90518,36.1148 z"
                        style="fill:#016fd0;fill-opacity:1;stroke:none"/>
                    <path
                        style="fill:#016fd0;fill-opacity:1;stroke:none"
                        d="m 499.86944,1560.1414 0,117.2641 30.08751,0 0,-37.0308 30.85899,0 c 26.11107,0 45.90274,-13.8524 45.90274,-40.7917 0,-22.3164 -15.52271,-39.4416 -42.09358,-39.4416 l -64.75566,0 z m 30.08751,26.5194 32.49837,0 c 8.43546,0 14.46515,5.1701 14.46515,13.5008 0,7.8262 -5.99925,13.5008 -14.56158,13.5008 l -32.40194,0 0,-27.0016 z"
                        id="path3068"
                        inkscape:connector-curvature="0"/>
                    <path
                        inkscape:connector-curvature="0"
                        style="fill:#016fd0;fill-opacity:1;stroke:none"
                        d="m 619.44802,1560.1216 0,117.2642 29.31604,0 0,-41.6597 12.34359,0 35.15032,41.6597 35.82536,0 -38.57374,-43.2026 c 15.83089,-1.3361 32.16085,-14.9233 32.16085,-36.0183 0,-24.6764 -19.36827,-38.0433 -40.98459,-38.0433 l -65.23783,0 z m 29.31604,26.2302 33.51093,0 c 8.03881,0 13.88654,6.2881 13.88654,12.3435 0,7.7906 -7.57673,12.3436 -13.45259,12.3436 l -33.94488,0 0,-24.6871 z"
                        id="path3072"/>
                    <path
                        sodipodi:nodetypes="ccccccccccccccccc"
                        inkscape:connector-curvature="0"
                        id="path3074"
                        d="m 847.18735,1677.3858 0,-25.4587 58.67066,0 c 8.68115,0 12.44003,-4.6912 12.44003,-9.8363 0,-4.9296 -3.74703,-9.9134 -12.44003,-9.9134 l -26.5126,0 c -23.04571,0 -35.88042,-14.0409 -35.88042,-35.1214 0,-18.8023 11.75348,-36.9344 45.99918,-36.9344 l 57.08913,0 -12.3436,26.3844 -49.37438,0 c -9.43821,0 -12.3436,4.9526 -12.3436,9.6821 0,4.8612 3.59036,10.222 10.80065,10.222 l 27.77309,0 c 25.69029,0 36.83792,14.5724 36.83792,33.6556 0,20.5163 -12.42212,37.3201 -38.23646,37.3201 z"
                        style="fill:#016fd0;fill-opacity:1;stroke:none"/>
                    <path
                        style="fill:#016fd0;fill-opacity:1;stroke:none"
                        d="m 954.78398,1677.3858 0,-25.4587 58.67062,0 c 8.6812,0 12.4401,-4.6912 12.4401,-9.8363 0,-4.9296 -3.7471,-9.9134 -12.4401,-9.9134 l -26.51256,0 c -23.04571,0 -35.88043,-14.0409 -35.88043,-35.1214 0,-18.8023 11.75348,-36.9344 45.99918,-36.9344 l 57.08911,0 -12.3436,26.3844 -49.37436,0 c -9.4382,0 -12.34359,4.9526 -12.34359,9.6821 0,4.8612 3.59035,10.222 10.80064,10.222 l 27.77311,0 c 25.6903,0 36.8379,14.5724 36.8379,33.6556 0,20.5163 -12.4221,37.3201 -38.2365,37.3201 z"
                        id="path3076"
                        inkscape:connector-curvature="0"
                        sodipodi:nodetypes="ccccccccccccccccc"/>
                </g>
            </svg>;
        default:
            return <div className="w-10 h-10 bg-gray-200 rounded"></div>; // Empty placeholder
    }
};

export default CardType;
