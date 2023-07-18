function modifyData()
{
    // Some function to read a file
    const input = new File([new Blob()],"../data/area2_vtget_opt.csv");
    const reader = new FileReader();

    reader.onload = function(e){
        const text = e.target.result;
        console.log(text);
    };

    reader.readAsText(input);

    // Data structure to store the class distribution values for each point
    // Probably a dictionary 
}
export default modifyData;