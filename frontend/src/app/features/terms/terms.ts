import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameHeaderComponent } from '../../shared/game-header/game-header';

@Component({
    selector: 'app-terms',
    standalone: true,
    imports: [GameHeaderComponent, RouterLink],
    templateUrl: './terms.html',
    styleUrls: ['../quiz/quiz.scss', './terms.scss'],
})
export class TermsComponent implements OnInit, OnDestroy {
    readonly paragraphs = [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam purus risus, cursus et eros nec, lacinia facilisis nulla. Morbi tincidunt est at eros euismod, sed iaculis nisi iaculis. Pellentesque ut magna cursus, pellentesque turpis nec, porta elit. Duis ut fermentum arcu. Sed non augue vel turpis vehicula scelerisque vel sed odio. Cras nec ipsum nibh. Pellentesque non ligula tristique tellus tristique viverra. Vestibulum varius lobortis porta. Cras fringilla ex et erat lobortis gravida. Donec quis metus sodales, dignissim lectus ac, accumsan mauris. Donec facilisis et tortor eget commodo. Integer pretium mi elementum mauris interdum gravida. Suspendisse ut eleifend tortor, vel pulvinar dui. Vivamus lobortis ex ut augue vulputate facilisis. Vestibulum sed gravida velit.',
        'Phasellus suscipit sagittis metus eget lobortis. Praesent vel tincidunt dui, vitae volutpat mauris. Cras tristique velit id tincidunt sollicitudin. Integer rhoncus placerat ex sed egestas. Suspendisse eu arcu gravida, viverra erat eget, elementum arcu. Fusce varius ultricies risus eu vulputate. Aenean malesuada quam eu lacus porta eleifend. Etiam aliquam neque laoreet ipsum eleifend, eget elementum nunc congue. In hac habitasse platea dictumst. Etiam dapibus ultrices ligula, ut cursus ipsum convallis nec.',
        'Cras porttitor neque augue, quis blandit velit sodales sit amet. Aenean eu sem ac erat consequat accumsan. Proin et turpis convallis, semper elit sed, pellentesque felis. Nunc rutrum augue vulputate elit auctor, ac gravida sapien sagittis. Quisque ut neque mauris. Proin rutrum augue purus, a tempus justo iaculis a. Mauris arcu ipsum, sagittis sed porttitor at, congue eu ante. Fusce consequat lobortis consectetur. Nulla tristique est ut efficitur tincidunt. Integer a ante nec mauris lacinia scelerisque. Donec interdum, felis consequat pulvinar cursus, purus metus hendrerit enim, non rhoncus lectus magna eget quam. In pellentesque turpis ac gravida accumsan. Etiam et justo ipsum. Quisque faucibus nisl vel arcu dignissim tempor.',
    ];

    ngOnInit() {
        document.body.classList.add('quiz-route');
    }

    ngOnDestroy() {
        document.body.classList.remove('quiz-route');
    }
}
