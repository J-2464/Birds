export function equationGenerator(digA, digB, operator){
    const numCon = [0, 9, 99, 999, 999];
    const ops = ['+', '-', '*', '/'];
    let numA = Math.floor(Math.random()*numCon[digA]+1);
    let numB = Math.floor(Math.random()*numCon[digB]+1);
    let equation = numA + " " + ops[operator] + " " + numB;
    return equation;
}


export function wrongAnswer(suh){
   
    let rng = Math.random();
    let addsub = Math.random();
    let decision = Math.random();
    let fake;
    let diff;
    switch (true){
            
        //if answer less then 10 add or sub by 4 then ensure positibity
        case(suh<=10): 
        diff = Math.ceil(rng*4);
        if(addsub<0.5){
            fake = suh-diff;
        }
        else{fake = suh+diff};
        break;

        //if answer less than 100 half change tens digit by 10, have change ones digit by 8 +- evens only
        case(suh<=100):

            switch (true){
                case(decision<0.5):
                    if(addsub<0.5){
                        fake = suh-10;
                    }
                    else{fake = suh+10;}
                    break;

                case(decision<1):
                    diff = Math.ceil(rng*4)*2
                    if(addsub<0.5){
                        fake = suh-diff;
                    }
                    else{fake = suh+diff;}
                    break;
            }
        break;

        //if less 1000 40 change tens 40 change hundred 20 changes ones
        case(suh<=1000):
        switch (true){
            case(decision<0.4):
                if(addsub<0.5){
                    fake = suh-100;
                }
                else{fake = suh+100;}
                break;

            case(decision<0.8):
                diff = Math.ceil(rng*4)*10
                if(addsub<0.5){
                    fake = suh-diff;
                }
                else{fake = suh+diff;}
                break;

            case(decision<1):
                diff = Math.ceil(rng*4)*2
                if(addsub<0.5){
                    fake = suh-diff;
                }
                else{fake = suh+diff;}
                break;
        }
        break;

        //same logic but absorb half hundred change to 1000 change
        case(suh<10000):
        switch (true){
            case(decision<0.2):
            if(addsub<0.5){
                fake = suh-1000;
            }
            else{fake = suh+1000;}
            break;

            case(decision<0.4):
            diff = Math.ceil(rng*4)*100
                if(addsub<0.5){
                    fake = suh-diff;
                }
                else{fake = suh+diff;}
                break;

            case(decision<0.8):
                diff = Math.ceil(rng*4)*10
                if(addsub<0.5){
                    fake = suh-diff;
                }
                else{fake = suh+diff;}
                break;

            case(decision<1):
                diff = Math.ceil(rng*4)*2
                if(addsub<0.5){
                    fake = suh-diff;
                }
                else{fake = suh+diff;}
                break;
        }
        break;

        //all else same logic
        case(suh<=1000000):
        switch (true){
            case(decision<0.15):
                if(addsub<0.5){
                    fake = suh-100000;
                }
                else{fake = suh+100000;}
                break;

                case(decision<0.3):
                diff = Math.ceil(rng*4)*10000
                    if(addsub<0.5){
                        fake = suh-diff;
                    }
                    else{fake = suh+diff;}
                    break;

                    case(decision<0.4):
                    diff = Math.ceil(rng*4)*1000
                        if(addsub<0.5){
                            fake = suh-diff;
                        }
                        else{fake = suh+diff;}
                        break;

            case(decision<0.5):
            diff = Math.ceil(rng*4)*100
                if(addsub<0.5){
                    fake = suh-diff;
                }
                else{fake = suh+diff;}
                break;

            case(decision<0.8):
                diff = Math.ceil(rng*4)*10
                if(addsub<0.5){
                    fake = suh-diff;
                }
                else{fake = suh+diff;}
                break;

            case(decision<1):
                diff = Math.ceil(rng*4)*2
                if(addsub<0.5){
                    fake = suh-diff;
                }
                else{fake = suh+diff;}
                break;
        }
        break;

    }  
    if(fake<0) {fake*=-1;}//ensure positive fake
    if(fake==suh){fake++;}//ensure they aint the same highly unlikely but incase

    return fake;
}