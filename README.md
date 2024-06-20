Lexical Editor V 0.0.2

Editor developed for Track my process

1. Introduccion
   
   This component is developed on Lexical, a super customizable open source editor, which allows us to create different nodes and functionalities through CSS.
   It is developed with the purpose of supporting the different sections within the application such as comments, which must be able to add all the necessary information such as images among other elements.

2. Preview

   ![image](https://github.com/juniorSacarias/Lexical_RTE_v0.0.1/assets/170922142/5ccbf806-f904-42e2-9198-970da2de4548)

3. Technical requeriments:

  As technical requirements, the text editor must be able to:

    a. Enter text and change its size,
    b. Being able to change the different styles such as bold, italic among others,
    c. Must be able to use lists and numbering
    d. Being able to add images and adjust them
    e. Enter Links
    f. Create tables
    g. Adjust text position
   
  These are the minimum requirements that you must meet in order to pass the technical cut

4. Version initial ( v0.0.2 )

   In the initial version I have developed 95% of the functionalities that it should have in addition to a time tracker which allows us to advance or go back steps if necessary
   Below I will develop all the functionalities one by one together with an example video

   1. Text and change its size

      In this version we can enter text without restrictions as well as being able to increase or decrease the size by two points and if we want to return it to its original size press "T"

       [screen-capture (5).webm](https://github.com/juniorSacarias/Lexical_RTE_v0.0.1/assets/170922142/77258e64-771f-470d-b207-36b3d182a290)


   3. Change styles.

      In this version we are able to changes the styles of the text with with four possible options: Bold, Italic, Underline and Strikethrough
      
      [screen-capture (1).webm](https://github.com/juniorSacarias/Lexical_RTE_v0.0.1/assets/170922142/537b58ea-544c-4f05-8546-75fdf29e4eb0)

      In v.0.0.2 you can change the Font Family for all the Editor

      [screen-capture (7).webm](https://github.com/juniorSacarias/Lexical_RTE_v0.0.1/assets/170922142/cb1c8840-7767-4ea1-85d5-9ef64aa9083f)

   5. Use List and numbering

      We are able to create List and numbering in the text
      
      [screen-capture (2).webm](https://github.com/juniorSacarias/Lexical_RTE_v0.0.1/assets/170922142/58471f91-0606-48da-8b58-52ff3ac3cc9d)

   6. Add Images and ajust them

      We can add images and resize them within the limit of the text box, images can be entered from our local files or from a web url, for example, Google Images
      
      [screen-capture (3).webm](https://github.com/juniorSacarias/Lexical_RTE_v0.0.1/assets/170922142/fb4e1535-fe0c-48d2-8bb3-4c0649d1d785)

  4. Enter links

     We can create links with specific words, you need to press enter to save the link
     
     [screen-capture (4).webm](https://github.com/juniorSacarias/Lexical_RTE_v0.0.1/assets/170922142/c2dc3fd8-53cc-45ee-9157-6736c81f19bd)

  5. Create Tables

     We can create tables with specific rows and columns.

     [screen-capture (6).webm](https://github.com/juniorSacarias/Lexical_RTE_v0.0.1/assets/170922142/52dcb236-9700-44e7-9bad-5e4a7f42aff2)

  6. JSON serialized

      Lexical allows us to serialize all the content of the editor to be able to store it, which is why we have introduced a serialization system which generates one node per element created in the editor, you can see it in the History Tree and specifically in the text section of each node written information is found

      ![image](https://github.com/juniorSacarias/Lexical_RTE_v0.0.1/assets/170922142/0d9f3407-c806-44ff-ba4d-9dcb2cd401f9)


4. Improvements and future versions

   As we have seen, this component is still very green and needs polishing, developing existing functionalities and adding new ones. That is why little by little I will add the different changes to the repository. The final goal is to obtain a complete component but currently version 0.0.2 has been generated as an MVP.

   Features pending development or improvement:
   
        a. Add images from remote
        b. Settings and customization for tables

