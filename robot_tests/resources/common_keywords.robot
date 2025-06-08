***Settings***
Library    SeleniumLibrary    
Library    OperatingSystem
Library    String 

***Variables***
${BROWSER} =    edge
${BASE_URL} =    http://localhost:8080
${PASSWORD} =    TestPass123! 
${POST_TITLE} =    SomeTitle
${POST_DESCRIPTION} =    SomeDescription
${POST_BODY} =    Body


***Keywords***
Open Browser To Login Page
    Open Browser    ${BASE_URL}/login    ${BROWSER}
    Maximize Browser Window

Go To Registration Page
    Click Link    Or Sign Up

Fill Registration Form
    [Arguments]    ${username}    ${email}    ${password}    ${confirm_password}
    Input Text    id=username    ${username}
    Input Text    id=email       ${email}
    Input Text    id=password    ${password}
    Input Text    id=confirm     ${confirm_password}

Submit Registration Form
    Click Element    id=register

Generate And Set User Credentials
    ${random_part} =    Generate Random String    8    ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789
    ${dynamic_username} =    Catenate    SEPARATOR=    testuser    ${random_part}
    ${dynamic_email} =       Catenate    SEPARATOR=@    ${dynamic_username}    example.com
    Set Suite Variable    ${USERNAME}    ${dynamic_username}
    Set Suite Variable    ${EMAIL}       ${dynamic_email}