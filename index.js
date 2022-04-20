/*
    A simple Twitter bot that posts random images.
    Tutorial: https://botwiki.org/resource/tutorial/random-image-tweet/
*/

const fs = require( 'fs' ),
      path = require( 'path' ),
      Twit = require( 'twit' ),
      config = require( path.join( __dirname, 'config.js' ) );

const T = new Twit( config );

function randomFromArray( arr ){
    /* hjælpe funktion for at vælge et tilfældigt element fra et array. */

    return arr[Math.floor( Math.random() * arr.length )];
}

function tweetRandomImage(){
    /* Først, indlæs alle billederne fra images mappen. */

    fs.readdir( __dirname + '/images', function( err, files ){
        if ( err ){
            console.log( 'error:', err );
            return;
        }
        else{
            let images = [];

            files.forEach( function( f ){
                images.push( f );
            } );

            /* Derefter tager den et tilfældigt billede fra mappen. */

            console.log( 'opening an image...' );

            const imagePath = path.join( __dirname, '/images/' + randomFromArray( images ) ),
                  imageData = fs.readFileSync( imagePath, { encoding: 'base64' } );

            /* Her uploader billedet til twitter for at skabe tweeten */

            console.log( 'uploading an image...', imagePath );

            T.post( 'media/upload', { media_data: imageData }, function ( err, data, response ){
                if ( err ){
                    console.log( 'error:', err );
                }
                else{
                    /* Her kan man tilføje en beskrivelse af billedet. */
                    
                    const image = data;
                    console.log( 'image uploaded, adding description...' );

                    T.post( 'media/metadata/create', {
                        media_id: image.media_id_string,
                        alt_text: {
                            text: 'A beautiful man'
                        }            
                    }, function( err, data, response ){

                        /* Til sidst skab en tweet med billedet. */

                        T.post( 'statuses/update', {
                            // Her tilføjer man hvad der skal stå på tweeten
                            status: "I'm really tired today?! #Twitterbot",
                            media_ids: [image.media_id_string]
                        },
                        function( err, data, response){
                            if (err){
                                console.log( 'error:', err );
                            }
                            else{
                                console.log( 'posted an image!' );

                                /*
                                    Efter man har lavet en tweet, så kan man slette billedet som blev brugt
                                    Eller gemme det i en ny mappe
                                */

                                fs.unlink( imagePath, function( err ){
                                  if ( err ){
                                    console.log( 'error: unable to delete image ' + imagePath );
                                  }
                                  else{
                                    console.log( 'image ' + imagePath + ' was deleted' );
                                  }
                                } );
                            }
                        } );
                    } );
                }
            } );
        }
    } );
}

setInterval( function(){
    tweetRandomImage();
}, 10000 );

