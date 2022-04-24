// Tilføjer moduler, config.js fil og twit biblotek til filen
const fs = require( 'fs' ),
      path = require( 'path' ),
      Twit = require( 'twit' ),
      config = require( path.join( __dirname, 'config.js' ) );

// Opretter forbindelse til vores Twitter konto
const T = new Twit( config );

/* hjælpe funktion for at vælge et tilfældigt billede fra vores images mappe */
function randomFromArray( arr ){
    return arr[Math.floor( Math.random() * arr.length )];
}

function tweetAdd(){
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
                            text: 'A beautiful beer'
                        }            
                    }, function( err, data, response ){
                        // Her bliver der skabt nogle tilfældige stykker tekst som kan blive
                        // Tilføjet til vores reklame
                        const textArray = [
                            'Her får du de bedste alkoholfrie øl! #ThistedBryghus',
                            'Mangler du en fest for de unge? Jamen så kom forbi og køb en alkoholfri øl! #ThistedBryghus',
                            'Hvad mangler de unge? øl! derfor kan dit barn nu få alkoholfri øl hos os #ThistedBryghus',
                            'Prøv vores klassiske thy øl! #ThistedBryghus'
                        ];
                        
                        var randomText = Math.floor(Math.random()*textArray.length);

                        /* Til sidst skab en tweet med billedet. */

                        T.post( 'statuses/update', {
                            // Her bliver der tilføjet tekst til opslaget
                            status: textArray[randomText] + image.source,
                            // Vi tilføjer her billedet til opslaget
                            media_ids: [image.media_id_string]
                        },
                        function( err, data, response){
                            if (err){
                                console.log( 'error:', err );
                            }
                            else{
                                console.log( 'posted a new tweet!' );

                                /*
                                    Efter man har lavet et opslag, så sletter robotten billedet som blev brugt
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
    tweetAdd();
}, 10000 );