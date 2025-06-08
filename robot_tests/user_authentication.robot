***Settings***
Resource    resources/common_keywords.robot
Test Setup    Open Browser To Login Page

***Test Cases***
Successful User Registration
    Generate And Set User Credentials 
    Go To Registration Page
    Fill Registration Form    ${USERNAME}    ${EMAIL}    ${PASSWORD}    ${PASSWORD}
    Submit Registration Form
    [Teardown]    Close Browser

Successful User Login and Post
    Input Text    id=username    ${USERNAME}
    Input Text    id=password    ${PASSWORD}
    Click Element    id=login 
    Go To    ${BASE_URL}/post
    Input Text    id=title       ${POST_TITLE}
    Input Text    id=description        ${POST_DESCRIPTION}
    Input Text    id=body        ${POST_BODY}
    Click Element  id=post
    [Teardown]    Close Browser

